import Scheme from '../../models/Scheme.js';
import EligibilityRule from '../../models/EligibilityRule.js';

/**
 * Retrieve verified scheme context from MongoDB based on query terms and citizen profile
 */
export const retrieveRelevantSchemeContext = async (queryText, userProfile = null) => {
  try {
    const text = String(queryText || '').toLowerCase();
    const words = text.replace(/[^a-zA-Z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2);

    const regexArray = words.map((w) => new RegExp(w, 'i'));

    // Find schemes matching query words in name, category, description, or target beneficiaries
    let schemes = await Scheme.find({
      isActive: true,
      $or: [
        { schemeName: { $in: regexArray } },
        { category: { $in: regexArray } },
        { shortDescription: { $in: regexArray } },
        { targetBeneficiaries: { $in: regexArray } },
        { objectives: { $in: regexArray } },
      ],
    })
      .limit(4)
      .populate('departmentId', 'departmentName ministryName')
      .lean();

    // If no direct matches, return general top active schemes
    if (schemes.length === 0) {
      schemes = await Scheme.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('departmentId', 'departmentName ministryName')
        .lean();
    }

    // Fetch rules for these schemes
    const schemeIds = schemes.map((s) => s._id);
    const rules = await EligibilityRule.find({ schemeId: { $in: schemeIds }, isActive: true }).lean();

    let contextString = 'VERIFIED GOVERNMENT SCHEME DATABASE CONTEXT:\n';

    for (const scheme of schemes) {
      const sRules = rules.filter((r) => r.schemeId.toString() === scheme._id.toString());
      const deptName = scheme.departmentId?.departmentName || 'Government of India';
      const ministryName = scheme.departmentId?.ministryName || scheme.ministry || 'Government of India';

      contextString += `\n- Scheme: ${scheme.schemeName}\n`;
      contextString += `  Category: ${scheme.category} | Level: ${scheme.schemeLevel} | Ministry: ${ministryName} (${deptName})\n`;
      contextString += `  Applicable States: ${Array.isArray(scheme.applicableStates) ? scheme.applicableStates.join(', ') : 'All India'}\n`;
      contextString += `  Description: ${scheme.shortDescription}\n`;

      if (scheme.benefits && scheme.benefits.length > 0) {
        contextString += `  Benefits: ${scheme.benefits.map((b) => `${b.title}: ${b.description || ''} ${b.amount ? `(${b.amount})` : ''}`).join('; ')}\n`;
      }

      if (scheme.targetBeneficiaries && scheme.targetBeneficiaries.length > 0) {
        contextString += `  Target Beneficiaries: ${scheme.targetBeneficiaries.join(', ')}\n`;
      }

      if (scheme.requiredDocuments && scheme.requiredDocuments.length > 0) {
        contextString += `  Required Documents: ${scheme.requiredDocuments.map((d) => d.name || d.documentName).join(', ')}\n`;
      }

      if (sRules.length > 0) {
        contextString += `  Eligibility Criteria Rules: ${sRules.map((r) => `${r.field} ${r.operator} ${JSON.stringify(r.expectedValue)} (${r.description || ''})`).join('; ')}\n`;
      }

      if (scheme.officialApplicationUrl || scheme.officialWebsite) {
        contextString += `  Official Portal URL: ${scheme.officialApplicationUrl || scheme.officialWebsite}\n`;
      }
    }

    if (userProfile) {
      contextString += `\nCITIZEN DEMOGRAPHIC PROFILE (Logged-in user asking query):\n`;
      if (userProfile.occupation) contextString += `- Occupation: ${userProfile.occupation}\n`;
      if (userProfile.state) contextString += `- State: ${userProfile.state}\n`;
      if (userProfile.annualFamilyIncome !== null && userProfile.annualFamilyIncome !== undefined) {
        contextString += `- Annual Family Income: ₹${userProfile.annualFamilyIncome.toLocaleString('en-IN')}\n`;
      }
      if (userProfile.community) contextString += `- Category/Community: ${userProfile.community}\n`;
      if (userProfile.gender) contextString += `- Gender: ${userProfile.gender}\n`;
    }

    return { contextString, matchedSchemes: schemes };
  } catch (err) {
    console.error('Error retrieving scheme context:', err);
    return { contextString: '', matchedSchemes: [] };
  }
};

/**
 * Call OpenRouter Qwen Cloud API
 */
const callOpenRouter = async (systemPrompt, messages) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const model = process.env.QWEN_MODEL || 'qwen/qwen-2.5-7b-instruct:free';

  const payload = {
    model,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    temperature: 0.3,
    max_tokens: 1024,
  };

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'Government Scheme Eligibility Engine',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.warn(`OpenRouter API error (${res.status}):`, errorText);
    return null;
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content;
  return reply ? { text: reply, provider: `Qwen via OpenRouter (${model})` } : null;
};

/**
 * Call Hugging Face Qwen Inference API
 */
const callHuggingFace = async (systemPrompt, messages) => {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) return null;

  const modelId = process.env.QWEN_HF_MODEL || 'Qwen/Qwen2.5-72B-Instruct';

  const res = await fetch(`https://api-inference.huggingface.co/models/${modelId}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 1024,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.warn(`HuggingFace API error (${res.status}):`, errorText);
    return null;
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content;
  return reply ? { text: reply, provider: `Qwen 2.5 via Hugging Face (${modelId})` } : null;
};

/**
 * Local Scheme Grounded Knowledge Engine (Fallback when no cloud API key is configured or offline)
 */
const generateGroundedResponse = (lastUserMessage, matchedSchemes, userProfile) => {
  const query = lastUserMessage.toLowerCase();

  if (matchedSchemes.length === 0) {
    return {
      text: `Namaste! I am your National Scheme Assistant powered by Qwen. I couldn't find a specific scheme matching your exact terms in our current database. 

You can:
• Browse all verified initiatives in the **Explore Schemes** catalog.
• Check your personalized evaluation in **Check Eligibility**.
• Make sure your **Citizen Profile** is up to date to get tailored recommendations.`,
      provider: 'Qwen Scheme Grounding Engine (Local Knowledge Fallback)',
    };
  }

  const primary = matchedSchemes[0];
  let reply = `Namaste! Based on official records in the Government Scheme Eligibility Engine, here is verified information for **${primary.schemeName}**:\n\n`;

  reply += `📋 **Overview & Ministry**:\n${primary.shortDescription}\nAdministered by: **${primary.ministry || 'Government of India'}** (${primary.departmentId?.departmentName || 'National Department'}).\n\n`;

  if (primary.benefits && primary.benefits.length > 0) {
    reply += `💰 **Key Benefits**:\n`;
    primary.benefits.forEach((b) => {
      reply += `• **${b.title}**: ${b.description || ''} ${b.amount ? `(*Amount: ${b.amount}*)` : ''}\n`;
    });
    reply += `\n`;
  }

  if (primary.targetBeneficiaries && primary.targetBeneficiaries.length > 0) {
    reply += `🎯 **Target Beneficiaries**:\n`;
    reply += `• ${primary.targetBeneficiaries.join(', ')}\n\n`;
  }

  if (primary.requiredDocuments && primary.requiredDocuments.length > 0) {
    reply += `📄 **Required Documents**:\n`;
    primary.requiredDocuments.forEach((d) => {
      const docName = d.name || d.documentName || 'Document Proof';
      const isReq = d.mandatory ?? d.isMandatory ?? true;
      reply += `• ${docName} ${isReq ? '*(Mandatory)*' : '*(Optional)*'}\n`;
    });
    reply += `\n`;
  }

  if (userProfile && userProfile.occupation) {
    reply += `💡 **Profile Match Note**:\nYour profile indicates occupation as **${userProfile.occupation}** in **${userProfile.state || 'India'}**. You can perform a real-time deterministic eligibility check using the **Check Eligibility** module.\n\n`;
  }

  if (primary.officialApplicationUrl || primary.officialWebsite) {
    reply += `🔗 **Official Portal**: [Access Scheme Website](${primary.officialApplicationUrl || primary.officialWebsite})\n\n`;
  }

  reply += `*Note: Final sanction and benefit disbursal remain under the sole jurisdiction of the administering government authorities.*`;

  return {
    text: reply,
    provider: 'Qwen Scheme Grounding Engine (Verified Database Match)',
  };
};

/**
 * Main chat completion handler
 */
export const getQwenChatResponse = async ({ messages, userProfile = null }) => {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new Error('Messages array is required');
  }

  const lastUserMsg = messages[messages.length - 1]?.content || '';

  // 1. Retrieve grounded database context
  const { contextString, matchedSchemes } = await retrieveRelevantSchemeContext(lastUserMsg, userProfile);

  // 2. Prepare System Prompt for Qwen
  const systemPrompt = `You are the National Scheme Assistant for the Government Scheme Eligibility Engine of India, an official citizen assistance platform powered by Qwen.
Your mission is to provide accurate, transparent, and structured answers to Indian citizens seeking information about Central and State government welfare schemes, subsidies, grants, eligibility criteria, required documents, and application procedures.

Guidelines:
1. Ground your answers strictly in the verified scheme database context provided below.
2. If the user asks about a specific scheme, explain:
   - What the scheme is and which ministry administers it
   - Key financial or social benefits
   - Who is eligible (income limits, age, occupation, etc.)
   - Mandatory documents required
   - How to apply and the official website
3. If the citizen's profile is provided, explain whether they meet the criteria based on their stated occupation, income, and state.
4. Format your response cleanly using markdown (bullet points, bold headers, and numbered steps).
5. Always maintain a courteous, professional, and helpful tone suitable for a national public service portal.
6. Remind citizens that final application approval is subject to official government verification.

${contextString}`;

  // 3. Try OpenRouter Qwen API first
  try {
    const openRouterResult = await callOpenRouter(systemPrompt, messages);
    if (openRouterResult) {
      return {
        ...openRouterResult,
        matchedSchemes: matchedSchemes.map((s) => ({
          _id: s._id,
          schemeName: s.schemeName,
          category: s.category,
        })),
      };
    }
  } catch (err) {
    console.warn('OpenRouter call failed, falling back:', err.message);
  }

  // 4. Try Hugging Face Inference API next
  try {
    const hfResult = await callHuggingFace(systemPrompt, messages);
    if (hfResult) {
      return {
        ...hfResult,
        matchedSchemes: matchedSchemes.map((s) => ({
          _id: s._id,
          schemeName: s.schemeName,
          category: s.category,
        })),
      };
    }
  } catch (err) {
    console.warn('HuggingFace call failed, falling back:', err.message);
  }

  // 5. Intelligent Fallback: Grounded response from verified scheme database
  const fallbackResult = generateGroundedResponse(lastUserMsg, matchedSchemes, userProfile);
  return {
    ...fallbackResult,
    matchedSchemes: matchedSchemes.map((s) => ({
      _id: s._id,
      schemeName: s.schemeName,
      category: s.category,
    })),
  };
};
