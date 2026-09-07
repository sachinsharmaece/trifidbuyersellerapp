/**
 * ARCHITECTURE.md §2 — buyer and seller surfaces are EN / हिंदी. This session
 * only needs the strings for the OTP login flow and the two gate screens;
 * the dictionary grows with each later milestone's screens.
 */
export type Locale = 'en' | 'hi';

export const dictionary = {
  app_name: ['TriFid', 'ट्राईफिड'],
  enter_mobile: ['Enter your mobile number', 'अपना मोबाइल नंबर डालें'],
  mobile_placeholder: ['10-digit mobile number', '10 अंकों का मोबाइल नंबर'],
  invalid_mobile: ['Enter a valid 10-digit mobile number.', 'सही 10 अंकों का मोबाइल नंबर डालें।'],
  send_code: ['Send code', 'कोड भेजें'],
  enter_code: ['Enter the code sent to your phone', 'अपने फोन पर भेजा गया कोड डालें'],
  verify: ['Verify', 'सत्यापित करें'],
  resend: ['Resend code', 'कोड फिर भेजें'],
  code_wrong: [
    'That code is not right. Check the message and enter it again.',
    'कोड सही नहीं है। मैसेज देखकर दोबारा डालें।',
  ],
  code_expired: [
    'This code has expired. Ask for a new one.',
    'कोड की समय सीमा खत्म। नया कोड मंगाएँ।',
  ],
  new_device: [
    'New device. We sent a fresh code to your registered mobile.',
    'नया डिवाइस। रजिस्टर्ड मोबाइल पर नया कोड भेजा गया है।',
  ],
  locked_out: [
    'Too many attempts. Try again after 30 minutes, or call the sales desk.',
    'बहुत बार कोशिश हुई। 30 मिनट बाद कोशिश करें, या सेल्स डेस्क पर कॉल करें।',
  ],
  back: ['Back', 'वापस'],
  pending_title: ['Your registration is under review', 'आपका पंजीकरण समीक्षा में है'],
  pending_body: [
    'Our team is checking your details. This usually takes one business day.',
    'हमारी टीम आपकी जानकारी जाँच रही है। आमतौर पर एक कार्य दिवस लगता है।',
  ],
  rejected_title: ['Your registration was not approved', 'आपका पंजीकरण स्वीकृत नहीं हुआ'],
  rejected_body: [
    'Call the sales desk to find out why.',
    'कारण जानने के लिए सेल्स डेस्क पर कॉल करें।',
  ],
  blacklisted_title: ['This account is blocked', 'यह खाता ब्लॉक है'],
  blacklisted_body: ['Call the sales desk for help.', 'मदद के लिए सेल्स डेस्क पर कॉल करें।'],
  registration_coming_title: ['Registration is coming soon', 'पंजीकरण जल्द आ रहा है'],
  registration_coming_body: [
    'We could not find an account for this number yet. Full registration is not open here — please check back soon.',
    'इस नंबर के लिए अभी कोई खाता नहीं मिला। पूरा पंजीकरण अभी यहाँ खुला नहीं है — कृपया जल्द वापस देखें।',
  ],
  call_desk: ['Call the sales desk', 'सेल्स डेस्क को कॉल करें'],
  sign_out: ['Sign out', 'साइन आउट'],
  network_error: [
    'Could not reach the server. Check your connection and try again.',
    'सर्वर तक नहीं पहुँच सके। अपना कनेक्शन जाँचें और फिर कोशिश करें।',
  ],
  retry: ['Retry', 'फिर कोशिश करें'],
  loading: ['Loading…', 'लोड हो रहा है…'],
  buyer_home_title: ['Welcome, buyer', 'स्वागत है'],
  buyer_home_body: [
    'Rates and orders are coming in a later update.',
    'रेट और ऑर्डर बाद के अपडेट में आएंगे।',
  ],
  seller_home_title: ['Welcome, seller', 'स्वागत है'],
  seller_home_body: [
    'Listings and demand are coming in a later update.',
    'लिस्टिंग और मांग बाद के अपडेट में आएंगी।',
  ],
} satisfies Record<string, [string, string]>;

export type DictionaryKey = keyof typeof dictionary;

export function translate(locale: Locale, key: DictionaryKey): string {
  const entry = dictionary[key];
  return locale === 'hi' ? entry[1] : entry[0];
}
