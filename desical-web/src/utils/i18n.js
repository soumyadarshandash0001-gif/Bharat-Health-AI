/**
 * Bharat Health AI — i18n Engine
 * Supports: English, Hindi, Tamil, Odia
 */

export const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'or', label: 'ଓଡ଼ିଆ (Odia)' },
];

const translations = {
  en: {
    brand: 'Bharat Health AI',
    tagline: 'YOUR HEALTH COACH',
    newChat: 'New Conversation',
    features: 'FEATURES',
    chatItem: 'Chat',
    bmiCalc: 'BMI Calculator',
    mealPlan: 'Meal Plan',
    foodDb: 'Food Database',
    today: 'HISTORY',
    settings: 'Settings',

    welcomeTitle: 'Your AI Health Coach',
    welcomeSubtitle: 'Powered by Indian Food Science. Ask about nutrition, meal plans, diabetes management, and more.',

    qa1Icon: '🍛', qa1Text: 'Analyze My Meal', qa1Sub: 'Get calories & macros',
    qa2Icon: '📊', qa2Text: 'My Health Score', qa2Sub: 'Check your health assessment',
    qa3Icon: '💪', qa3Text: 'Protein-Rich Foods', qa3Sub: 'Build muscle, desi style',
    qa4Icon: '🧮', qa4Text: 'Calculate BMI', qa4Sub: 'With personalized advice',

    placeholder: 'Ask about diet, fitness, or health...',
    voiceListening: '🎙 Listening...',
    disclaimer: 'Bharat Health AI provides general info. Always consult your doctor.',

    limitTitle: '⚡ Free Limit Reached',
    limitBody: 'Upgrade to Premium for unlimited queries, personalized tracking, and WhatsApp integration.',
    limitCta: 'Upgrade to Premium — ₹199/mo',
  },
  hi: {
    brand: 'Bharat Health AI',
    tagline: 'आपका हेल्थ कोच',
    newChat: 'नई बातचीत',
    features: 'फीचर्स',
    chatItem: 'चैट',
    bmiCalc: 'BMI कैलकुलेटर',
    mealPlan: 'मील प्लान',
    foodDb: 'फूड डेटाबेस',
    today: 'इतिहास',
    settings: 'सेटिंग्स',

    welcomeTitle: 'आपका AI Health Coach',
    welcomeSubtitle: 'Indian food science से powered। पोषण, मील प्लान, डायबिटीज — कुछ भी पूछें।',

    qa1Icon: '🍛', qa1Text: 'मील एनालाइज करो', qa1Sub: 'कैलोरीज़ और मैक्रोज़ जानें',
    qa2Icon: '📊', qa2Text: 'मेरा Health Score', qa2Sub: 'अपनी health assessment देखें',
    qa3Icon: '💪', qa3Text: 'प्रोटीन वाले खाने', qa3Sub: 'देसी स्टाइल में मसल बनाओ',
    qa4Icon: '🧮', qa4Text: 'BMI कैलकुलेट करो', qa4Sub: 'Personalized सलाह के साथ',

    placeholder: 'भोजन, फिटनेस या हेल्थ के बारे में पूछें...',
    voiceListening: '🎙 सुन रहा हूँ...',
    disclaimer: 'Bharat Health AI सामान्य जानकारी देता है। हमेशा डॉक्टर से मिलें।',

    limitTitle: '⚡ Free Limit ख़त्म',
    limitBody: 'Premium लें — unlimited queries, personal tracking, WhatsApp integration।',
    limitCta: 'Premium लें — ₹199/माह',
  },
  ta: {
    brand: 'Bharat Health AI',
    tagline: 'உங்கள் உடல்நல பயிற்சியாளர்',
    newChat: 'புதிய உரையாடல்',
    features: 'அம்சங்கள்',
    chatItem: 'அரட்டை',
    bmiCalc: 'BMI கணிப்பான்',
    mealPlan: 'உணவு திட்டம்',
    foodDb: 'உணவு தரவு',
    today: 'வரலாறு',
    settings: 'அமைப்புகள்',

    welcomeTitle: 'உங்கள் AI உடல்நல பயிற்சியாளர்',
    welcomeSubtitle: 'இந்திய உணவு அறிவியல் மூலம். ஊட்டச்சத்து, உணவு திட்டங்கள் பற்றி கேளுங்கள்.',

    qa1Icon: '🍛', qa1Text: 'உணவை பகுப்பாய்வு செய்', qa1Sub: 'கலோரி மற்றும் மேக்ரோஸ்',
    qa2Icon: '📊', qa2Text: 'என் Health Score', qa2Sub: 'உடல்நல மதிப்பீடு',
    qa3Icon: '💪', qa3Text: 'புரத உணவுகள்', qa3Sub: 'தசை வளர்ச்சி',
    qa4Icon: '🧮', qa4Text: 'BMI கணக்கிடு', qa4Sub: 'தனிப்பட்ட ஆலோசனை',

    placeholder: 'உணவு, உடற்பயிற்சி பற்றி கேளுங்கள்...',
    voiceListening: '🎙 கேட்கிறது...',
    disclaimer: 'பொது தகவல் மட்டுமே. மருத்துவரை அணுகவும்.',

    limitTitle: '⚡ இலவச வரம்பு',
    limitBody: 'Premium-ஐ மேம்படுத்தவும்.',
    limitCta: 'Premium — ₹199/மாதம்',
  },
  or: {
    brand: 'Bharat Health AI',
    tagline: 'ଆପଣଙ୍କ ସ୍ୱାସ୍ଥ୍ୟ ପରାମର୍ଶଦାତା',
    newChat: 'ନୂଆ ବାର୍ତ୍ତାଳାପ',
    features: 'ଫିଚର୍ସ',
    chatItem: 'ଚାଟ',
    bmiCalc: 'BMI କ୍ୟାଲ୍କୁଲେଟର',
    mealPlan: 'ମିଲ ପ୍ଲାନ',
    foodDb: 'ଖାଦ୍ୟ ଡାଟାବେସ',
    today: 'ଇତିହାସ',
    settings: 'ସେଟିଂସ',

    welcomeTitle: 'ଆପଣଙ୍କ AI ସ୍ୱାସ୍ଥ୍ୟ ପରାମର୍ଶଦାତା',
    welcomeSubtitle: 'ଭାରତୀୟ ଖାଦ୍ୟ ବିଜ୍ଞାନ ଦ୍ୱାରା ଚାଳିତ। ପୋଷଣ, ଖାଦ୍ୟ ଯୋଜନା ବିଷୟରେ ପଚାରନ୍ତୁ।',

    qa1Icon: '🍛', qa1Text: 'ଖାଦ୍ୟ ବିଶ୍ଳେଷଣ', qa1Sub: 'କ୍ୟାଲୋରୀ ଓ ମାକ୍ରୋ',
    qa2Icon: '📊', qa2Text: 'ମୋର Health Score', qa2Sub: 'ସ୍ୱାସ୍ଥ୍ୟ ମୂଲ୍ୟାଙ୍କନ',
    qa3Icon: '💪', qa3Text: 'ପ୍ରୋଟିନ ଖାଦ୍ୟ', qa3Sub: 'ଶରୀର ଗଠନ',
    qa4Icon: '🧮', qa4Text: 'BMI ହିସାବ', qa4Sub: 'ବ୍ୟକ୍ତିଗତ ପରାମର୍ଶ',

    placeholder: 'ଖାଦ୍ୟ, ଫିଟନେସ ବା ସ୍ୱାସ୍ଥ୍ୟ ବିଷୟରେ ପଚାରନ୍ତୁ...',
    voiceListening: '🎙 ଶୁଣୁଛି...',
    disclaimer: 'ସାଧାରଣ ସୂଚନା ମାତ୍ର। ଡାକ୍ତରଙ୍କ ସହ ପରାମର୍ଶ କରନ୍ତୁ।',

    limitTitle: '⚡ ମାଗଣା ସୀମା',
    limitBody: 'Premium ନିଅନ୍ତୁ।',
    limitCta: 'Premium — ₹199/ମାସ',
  },
};

export function t(lang, key) {
  return translations[lang]?.[key] || translations.en[key] || key;
}
