// Comprehensive Trilingual Translations for Monor Xur (English, Hindi & Assamese / অসমীয়া)

export type Language = 'en' | 'hi' | 'as';

export interface Translations {
  [key: string]: string | undefined;
  // Navigation & Role Headers
  monorXur: string;
  playerMode: string;
  familyPortal: string;
  ashaWorker: string;
  caregiverPortal: string;
  returnToPlayer: string;
  caregiver: string;
  emergencyCall: string;
  setupAndProfiles: string;
  goBack: string;

  // Bottom Navigation
  navHome: string;
  navPlay: string;
  navMemories: string;
  navSettings: string;
  navInsights: string;
  navProgress: string;
  navCalendar: string;
  navAlerts: string;
  navProfile: string;
  navReport: string;
  navTasks: string;

  // Patient Home
  activeSession: string;
  hello: string;
  helloWelcome: string;
  playButtonText: string;
  playButtonSub: string;
  tileMemories: string;
  tileMemoriesSub: string;
  tileGames: string;
  tileGamesSub: string;
  tileRelaxation: string;
  tileRelaxationSub: string;
  tileDailyLife: string;
  tileDailyLifeSub: string;
  upNext: string;
  view: string;
  callFamilyPrompt: string;
  callFamilyDefault: string;
  callFamilySub: string;
  callNow: string;

  // Settings
  preferencesTitle: string;
  preferencesSub: string;
  activePlayer: string;
  mindExplorerLevel: string;
  themeSettingTitle: string;
  themeSettingSub: string;
  themeDefaultLabel: string;
  themeDefaultDesc: string;
  themeNorthEastLabel: string;
  themeNorthEastDesc: string;
  languageSettingTitle: string;
  languageSettingSub: string;
  englishLabel: string;
  hindiLabel: string;
  assameseLabel: string;
  activeBadge: string;
  offlineReadiness: string;
  cloudSynced: string;
  offlineMode: string;
  serviceWorkerActive: string;
  cachedLocally: string;
  coreProfile: string;
  todayDailyPlan: string;
  routineItemsCount: string;
  installHomeScreen: string;
  extraLargeText: string;
  extraLargeTextSub: string;
  audioChimes: string;
  audioChimesSub: string;
  testVoiceTitle: string;
  testVoiceSub: string;
  playSample: string;
  emergencyContactTitle: string;
  emergencyContactUnconfigured: string;
  callBtn: string;
  caregiverDashboardTitle: string;
  caregiverDashboardSub: string;
  switchToCaregiver: string;
  reconfigureProfile: string;

  // Games Hub
  gamesHubTitle: string;
  gamesHubSub: string;
  photoPuzzleTitle: string;
  photoPuzzleDesc: string;
  memoryMatchTitle: string;
  memoryMatchDesc: string;
  playNow: string;
  difficultyLabel: string;
  easy: string;
  medium: string;
  hard: string;
  backToHome: string;
  gameSessions: string;
  gameAccuracy: string;

  // Memory Match
  memoryMatchHeader: string;
  pairsFound: string;
  moves: string;
  time: string;
  hint: string;
  restart: string;
  wellDone: string;
  completedInMoves: string;
  nextRound: string;
  playAgain: string;

  // Photo Puzzle
  photoPuzzleHeader: string;
  originalPhoto: string;
  viewOriginal: string;
  tilesLeft: string;
  gridSize: string;
  shuffle: string;
  puzzleSolvedTitle: string;
  listenToStory: string;
  stopVoice: string;

  // Daily Life
  dailyLifeTitle: string;
  dailyLifeSub: string;
  allCompleted: string;
  markDone: string;
  done: string;
  morning: string;
  afternoon: string;
  evening: string;
  night: string;

  // Relaxation
  relaxationTitle: string;
  relaxationSub: string;
  breathingTitle: string;
  breathingSub: string;
  breatheIn: string;
  hold: string;
  breatheOut: string;
  startBreathing: string;
  pauseBreathing: string;
  resumeBreathing: string;
  musicTitle: string;
  musicSub: string;
  natureSounds: string;
  fluteSounds: string;
  bowlSounds: string;
  harpSounds: string;
  playMusic: string;
  stopMusic: string;

  // Memories
  memoriesTitle: string;
  memoriesSub: string;
  recordMemory: string;
  allMemories: string;
  familyTag: string;
  placesTag: string;
  cultureTag: string;
  dailyTag: string;
  previous: string;
  next: string;
  close: string;
  back: string;
  cancel: string;

  // Audio Diary
  audioDiaryTitle: string;
  audioDiarySub: string;
  tapToSpeak: string;
  stopRecording: string;
  listeningVoice: string;
  readyToRecord: string;
  voiceRecorded: string;
  playAudio: string;
  saveToMemories: string;

  // Spoken System Voice Text
  welcomeVoiceText: string;
  testVoiceSpeechText: string;
  languageSwitchedText: string;
  puzzleSuccessVoice: string;
  memorySuccessVoice: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Navigation & Role Headers
    monorXur: 'Monor Xur',
    playerMode: 'Player Mode • Mind Explorer',
    familyPortal: 'Family Companion Portal',
    ashaWorker: 'ASHA Health Worker',
    caregiverPortal: 'Caregiver Portal',
    returnToPlayer: 'Player Mode',
    caregiver: 'Caregiver',
    emergencyCall: 'Emergency Call',
    setupAndProfiles: 'First Time Setup & Profiles',
    goBack: 'Go back',

    // Bottom Navigation
    navHome: 'Home',
    navPlay: 'Play',
    navMemories: 'Memories',
    navSettings: 'Settings',
    navInsights: 'Insights',
    navProgress: 'Progress',
    navCalendar: 'Calendar',
    navAlerts: 'Alerts',
    navProfile: 'Profile',
    navReport: 'Report',
    navTasks: 'Tasks',

    // Patient Home
    activeSession: 'Active Session',
    hello: 'Hello, {name}!',
    helloWelcome: 'Hello, Welcome!',
    playButtonText: 'PLAY',
    playButtonSub: 'Press to open games',
    tileMemories: 'Memories',
    tileMemoriesSub: 'Family & moments',
    tileGames: 'Games & Puzzle',
    tileGamesSub: 'Photo puzzle & memory quests',
    tileRelaxation: 'Relaxation',
    tileRelaxationSub: 'Music & breathing',
    tileDailyLife: 'Daily Life',
    tileDailyLifeSub: 'Routines & tasks',
    upNext: 'Up Next',
    view: 'View',
    callFamilyPrompt: 'Call {name}',
    callFamilyDefault: 'Call Family / Emergency',
    callFamilySub: 'One tap to connect with your caregiver',
    callNow: 'Call Now',

    // Settings
    preferencesTitle: 'Player Preferences',
    preferencesSub: 'Display comfort, sound cues, and gaming settings.',
    activePlayer: 'Active Player',
    mindExplorerLevel: 'Mind Explorer • Level {level}',
    themeSettingTitle: 'Color Palette & Cultural Theme',
    themeSettingSub: 'Toggle between the North Eastern States palette and the classic soothing tea garden palette.',
    themeDefaultLabel: 'Classic Tea Garden',
    themeDefaultDesc: 'Soothing tea green, warm cream, and calming earthen tones.',
    themeNorthEastLabel: 'North Eastern Heritage',
    themeNorthEastDesc: 'Gamusa vermilion red, golden Muga silk, and warm loom ivory.',
    languageSettingTitle: 'Language / भाषा',
    languageSettingSub: 'Switch entire app interface and all spoken voices between English and Hindi.',
    englishLabel: 'English',
    hindiLabel: 'हिन्दी (Hindi)',
    assameseLabel: 'অসমীয়া (Assamese)',
    activeBadge: 'Active',
    offlineReadiness: 'Offline Readiness',
    cloudSynced: 'Cloud Synced',
    offlineMode: 'Offline Mode',
    serviceWorkerActive: 'Service Worker active: Core patient data & daily plan stored offline.',
    cachedLocally: 'Cached Locally',
    coreProfile: 'Core Profile & Medical Stage',
    todayDailyPlan: "Today's Daily Plan & Meds",
    routineItemsCount: '{count} Routine items',
    installHomeScreen: 'Install to home screen for full offline experience:',
    extraLargeText: 'Extra Large Text',
    extraLargeTextSub: 'Enlarge buttons and story descriptions',
    audioChimes: 'Audio Chimes & Cues',
    audioChimesSub: 'Gentle sounds on button taps & matches',
    testVoiceTitle: 'Test Read-Aloud Voice',
    testVoiceSub: 'Listen to sample storytelling voice',
    playSample: 'Play Sample',
    emergencyContactTitle: 'Emergency Contact',
    emergencyContactUnconfigured: 'Configure emergency contact in Caregiver Portal',
    callBtn: 'Call',
    caregiverDashboardTitle: 'Caregiver Dashboard',
    caregiverDashboardSub: 'For family members and ASHA health workers',
    switchToCaregiver: 'Switch to Caregiver Mode →',
    reconfigureProfile: '⚙️ Reconfigure Player Profile & PIN',

    // Games Hub
    gamesHubTitle: 'Mind Games Hub',
    gamesHubSub: 'Gentle cognitive exercises designed for comfort and stimulation.',
    photoPuzzleTitle: 'Photo Puzzle',
    photoPuzzleDesc: 'Reconstruct familiar family photos and heritage treasures.',
    memoryMatchTitle: 'Memory Match',
    memoryMatchDesc: 'Find pairs of traditional icons, tea cups, and wildlife.',
    playNow: 'Play Now',
    difficultyLabel: 'Level {level}',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    backToHome: 'Back to Home',
    gameSessions: 'Sessions',
    gameAccuracy: 'Accuracy',

    // Memory Match
    memoryMatchHeader: 'Memory Match',
    pairsFound: 'Pairs Found',
    moves: 'Moves',
    time: 'Time',
    hint: 'Hint',
    restart: 'Restart',
    wellDone: 'Wonderful Job!',
    completedInMoves: 'You matched all pairs in {moves} moves!',
    nextRound: 'Next Round',
    playAgain: 'Play Again',

    // Photo Puzzle
    photoPuzzleHeader: 'Photo Puzzle',
    originalPhoto: 'Original Photo',
    viewOriginal: 'View Original',
    tilesLeft: 'Tiles Left',
    gridSize: 'Grid Size',
    shuffle: 'Shuffle',
    puzzleSolvedTitle: 'Puzzle Solved!',
    listenToStory: 'Listen to Story',
    stopVoice: 'Stop Voice',

    // Daily Life
    dailyLifeTitle: "Today's Daily Plan",
    dailyLifeSub: 'Gentle schedule and reminders for your day.',
    allCompleted: 'All tasks completed for today! Well done.',
    markDone: 'Mark Done',
    done: 'Done',
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    night: 'Night',

    // Relaxation
    relaxationTitle: 'Relaxation & Serenity',
    relaxationSub: 'Calm your mind with guided breathing and gentle ambient sounds.',
    breathingTitle: 'Gentle Breathing',
    breathingSub: '4-4-4 diaphragmatic rhythm with soft bell chimes.',
    breatheIn: 'Breathe In...',
    hold: 'Hold gently...',
    breatheOut: 'Breathe Out...',
    startBreathing: 'Start Breathing Exercise',
    pauseBreathing: 'Pause',
    resumeBreathing: 'Resume',
    musicTitle: 'Calming Music & Ambience',
    musicSub: 'Soothing instrumental drones to ease restlessness and anxiety.',
    natureSounds: 'Nature & Birds',
    fluteSounds: 'Bamboo Flute',
    bowlSounds: 'Singing Bowl (432Hz)',
    harpSounds: 'Soothing Harp',
    playMusic: 'Play Sound',
    stopMusic: 'Stop Sound',

    // Memories
    memoriesTitle: 'Family Memories',
    memoriesSub: 'Cherished photos, places, and spoken stories.',
    recordMemory: 'Record Voice Story',
    allMemories: 'All Memories',
    familyTag: 'Family',
    placesTag: 'Places',
    cultureTag: 'Culture',
    dailyTag: 'Daily Life',
    previous: 'Previous',
    next: 'Next',
    close: 'Close',
    back: 'Back',
    cancel: 'Cancel',

    // Audio Diary
    audioDiaryTitle: 'Voice Reflection',
    audioDiarySub: 'Speak freely about your day or a special memory.',
    tapToSpeak: 'Tap to Speak',
    stopRecording: 'Stop Recording',
    listeningVoice: 'Listening to your voice...',
    readyToRecord: 'Ready to record',
    voiceRecorded: 'Voice recorded',
    playAudio: 'Play Audio',
    saveToMemories: 'Save to Memories',

    // Spoken System Voice Text
    welcomeVoiceText: 'Welcome to Monor Xur, {name}!',
    testVoiceSpeechText: 'Hello {name}. Read aloud is working warmly and clearly.',
    languageSwitchedText: 'Language set to English.',
    puzzleSuccessVoice: 'Wonderful job! You solved the puzzle.',
    memorySuccessVoice: 'Congratulations! You matched all pairs beautifully.',
  },

  hi: {
    // Navigation & Role Headers
    monorXur: 'मनोर सुर',
    playerMode: 'प्लेयर मोड • माइंड एक्सप्लोरर',
    familyPortal: 'परिवार साथी पोर्टल',
    ashaWorker: 'आशा स्वास्थ्य कार्यकर्ता',
    caregiverPortal: 'देखभालकर्ता पोर्टल',
    returnToPlayer: 'प्लेयर मोड',
    caregiver: 'देखभालकर्ता',
    emergencyCall: 'आपातकालीन कॉल',
    setupAndProfiles: 'आरंभिक सेटअप और प्रोफ़ाइल',
    goBack: 'वापस जाएं',

    // Bottom Navigation
    navHome: 'होम',
    navPlay: 'खेलें',
    navMemories: 'यादें',
    navSettings: 'सेटिंग्स',
    navInsights: 'अंतर्दृष्टि',
    navProgress: 'प्रगति',
    navCalendar: 'कैलेंडर',
    navAlerts: 'अलर्ट',
    navProfile: 'प्रोफ़ाइल',
    navReport: 'रिपोर्ट',
    navTasks: 'कार्य',

    // Patient Home
    activeSession: 'सक्रिय सत्र',
    hello: 'नमस्ते, {name}!',
    helloWelcome: 'नमस्ते, आपका स्वागत है!',
    playButtonText: 'खेलें',
    playButtonSub: 'खेल शुरू करने के लिए दबाएं',
    tileMemories: 'यादें',
    tileMemoriesSub: 'परिवार और अनमोल यादें',
    tileGames: 'खेल और पहेली',
    tileGamesSub: 'फोटो पहेली और दिमागी खेल',
    tileRelaxation: 'विश्राम और सुकून',
    tileRelaxationSub: 'शांत संगीत और श्वास अभ्यास',
    tileDailyLife: 'दिनचर्या',
    tileDailyLifeSub: 'दैनिक कार्य और दिनचर्या',
    upNext: 'आगे का कार्य',
    view: 'देखें',
    callFamilyPrompt: '{name} को कॉल करें',
    callFamilyDefault: 'परिवार / आपातकालीन कॉल',
    callFamilySub: 'एक स्पर्श में अपने परिवार से जुड़ें',
    callNow: 'अभी कॉल करें',

    // Settings
    preferencesTitle: 'प्लेयर प्राथमिकताएं व सेटिंग्स',
    preferencesSub: 'प्रदर्शन, आवाज़, भाषा और गेमिंग सेटिंग्स।',
    activePlayer: 'सक्रिय खिलाड़ी',
    mindExplorerLevel: 'माइंड एक्सप्लोरर • स्तर {level}',
    themeSettingTitle: 'रंग थीम और सांस्कृतिक पैलेट',
    themeSettingSub: 'उत्तर-पूर्वी राज्यों की पारंपरिक पैलेट या क्लासिक शांत चाय बगान पैलेट के बीच बदलें।',
    themeDefaultLabel: 'क्लासिक चाय बगान',
    themeDefaultDesc: 'शांत सेहुजिया हरा, सौम्य क्रीम और मिट्टी के गर्म रंग।',
    themeNorthEastLabel: 'उत्तर-पूर्व हेरिटेज (Seven Sisters)',
    themeNorthEastDesc: 'गमोसा लाल, मूँगा सिल्क सुनहरा और हथकरघा आइवरी।',
    languageSettingTitle: 'भाषा चुनें (Language)',
    languageSettingSub: 'पूरे ऐप की भाषा और बोलने वाली सभी आवाज़ों को हिन्दी और अंग्रेज़ी में बदलें।',
    englishLabel: 'English (अंग्रेज़ी)',
    hindiLabel: 'हिन्दी (Hindi)',
    assameseLabel: 'অসমীয়া (असमिया)',
    activeBadge: 'सक्रिय',
    offlineReadiness: 'ऑफ़लाइन तैयारी',
    cloudSynced: 'क्लाउड से जुड़ा',
    offlineMode: 'ऑफ़लाइन मोड',
    serviceWorkerActive: 'सर्विस वर्कर सक्रिय: मरीज़ का डेटा और दैनिक योजना ऑफ़लाइन सुरक्षित है।',
    cachedLocally: 'स्थानीय रूप से सुरक्षित',
    coreProfile: 'मुख्य प्रोफ़ाइल और मेडिकल स्तर',
    todayDailyPlan: 'आज की दिनचर्या और दवाइयां',
    routineItemsCount: '{count} दैनिक कार्य',
    installHomeScreen: 'पूर्ण ऑफ़लाइन अनुभव के लिए होम स्क्रीन पर जोड़ें:',
    extraLargeText: 'अतिरिक्त बड़े अक्षर',
    extraLargeTextSub: 'बटन और कहानियों के विवरण को बड़ा करें',
    audioChimes: 'ध्वनि संकेत और धुनें',
    audioChimesSub: 'बटन दबाने और सही मिलान पर मधुर धुनें',
    testVoiceTitle: 'बोलने वाली आवाज़ का परीक्षण',
    testVoiceSub: 'नमूना कहानी सुनाने वाली आवाज़ सुनें',
    playSample: 'नमूना सुनें',
    emergencyContactTitle: 'आपातकालीन संपर्क',
    emergencyContactUnconfigured: 'देखभालकर्ता पोर्टल में आपातकालीन संपर्क जोड़ें',
    callBtn: 'कॉल करें',
    caregiverDashboardTitle: 'देखभालकर्ता पोर्टल',
    caregiverDashboardSub: 'परिवार के सदस्यों और आशा कार्यकर्ताओं के लिए',
    switchToCaregiver: 'देखभालकर्ता मोड पर जाएं →',
    reconfigureProfile: '⚙️ प्लेयर प्रोफ़ाइल और पिन बदलें',

    // Games Hub
    gamesHubTitle: 'माइंड गेम्स हब',
    gamesHubSub: 'आपकी सुविधा और मानसिक स्फूर्ति के लिए सुखद दिमागी अभ्यास।',
    photoPuzzleTitle: 'फोटो पहेली',
    photoPuzzleDesc: 'परिवार की पुरानी तस्वीरें और सांस्कृतिक धरोहरों के टुकड़े जोड़ें।',
    memoryMatchTitle: 'मेमोरी मैच',
    memoryMatchDesc: 'पारंपरिक प्रतीकों, चाय के कप और प्रकृति के सही जोड़े खोजें।',
    playNow: 'अभी खेलें',
    difficultyLabel: 'स्तर {level}',
    easy: 'सरल',
    medium: 'मध्यम',
    hard: 'कठिन',
    backToHome: 'होम पर लौटें',
    gameSessions: 'सत्र',
    gameAccuracy: 'सटीकता',

    // Memory Match
    memoryMatchHeader: 'मेमोरी मैच',
    pairsFound: 'मिले जोड़े',
    moves: 'चालें',
    time: 'समय',
    hint: 'संकेत',
    restart: 'पुनः आरंभ करें',
    wellDone: 'बहुत खूब!',
    completedInMoves: 'आपने {moves} चालों में सभी जोड़े मिला लिए!',
    nextRound: 'अगला राउंड',
    playAgain: 'फिर से खेलें',

    // Photo Puzzle
    photoPuzzleHeader: 'फोटो पहेली',
    originalPhoto: 'मूल तस्वीर',
    viewOriginal: 'पूरी तस्वीर देखें',
    tilesLeft: 'बचे हुए टुकड़े',
    gridSize: 'ग्रिड आकार',
    shuffle: 'शफ़ल करें',
    puzzleSolvedTitle: 'पहेली हल हो गई!',
    listenToStory: 'कहानी सुनें',
    stopVoice: 'आवाज़ रोकें',

    // Daily Life
    dailyLifeTitle: 'आज की दिनचर्या',
    dailyLifeSub: 'आपके दिन के लिए आरामदेह समय-सारणी और याद दिलाव।',
    allCompleted: 'आज के सभी कार्य पूरे हो गए! बहुत बढ़िया।',
    markDone: 'पूरा हुआ',
    done: 'पूरा हो गया',
    morning: 'सुबह',
    afternoon: 'दोपहर',
    evening: 'शाम',
    night: 'रात',

    // Relaxation
    relaxationTitle: 'विश्राम और सुकून',
    relaxationSub: 'शांत श्वास अभ्यास और मधुर संगीत से मन को सुकून दें।',
    breathingTitle: 'आरामदायक श्वास अभ्यास',
    breathingSub: 'मधुर घंटियों के साथ 4-4-4 शांत श्वास चक्र।',
    breatheIn: 'साँस अंदर लें...',
    hold: 'रोक कर रखें...',
    breatheOut: 'साँस बाहर छोड़ें...',
    startBreathing: 'श्वास अभ्यास शुरू करें',
    pauseBreathing: 'रोकें',
    resumeBreathing: 'जारी रखें',
    musicTitle: 'शांत संगीत और धुनें',
    musicSub: 'बेचैनी और तनाव को दूर करने वाली मधुर धुनें।',
    natureSounds: 'प्रकृति और पक्षी',
    fluteSounds: 'बांसुरी की धुन',
    bowlSounds: 'सिंगिंग बाउल (432 हर्ट्ज़)',
    harpSounds: 'सुरीला वीणा संगीत',
    playMusic: 'संगीत सुनें',
    stopMusic: 'संगीत बंद करें',

    // Memories
    memoriesTitle: 'परिवार की यादें',
    memoriesSub: 'प्रिय तस्वीरें, स्थान और अपनों की आवाज की कहानियां।',
    recordMemory: 'अपनी आवाज़ में याद जोड़ें',
    allMemories: 'सभी यादें',
    familyTag: 'परिवार',
    placesTag: 'स्थान',
    cultureTag: 'संस्कृति',
    dailyTag: 'दिनचर्या',
    previous: 'पिछला',
    next: 'अगला',
    close: 'बंद करें',
    back: 'वापस जाएं',
    cancel: 'रद्द करें',

    // Audio Diary
    audioDiaryTitle: 'आवाज़ की डायरी',
    audioDiarySub: 'अपने दिन या किसी खास याद के बारे में खुलकर बोलें।',
    tapToSpeak: 'बोलने के लिए दबाएं',
    stopRecording: 'रिकॉर्डिंग समाप्त करें',
    listeningVoice: 'आपकी आवाज़ सुनी जा रही है...',
    readyToRecord: 'रिकॉर्ड करने के लिए तैयार',
    voiceRecorded: 'आवाज़ रिकॉर्ड हो गई',
    playAudio: 'आवाज़ सुनें',
    saveToMemories: 'यादों में सहेजें',

    // Spoken System Voice Text
    welcomeVoiceText: 'मनोर सुर में आपका स्वागत है, {name}!',
    testVoiceSpeechText: 'नमस्ते {name}। बोलने वाली आवाज़ साफ़ और स्पष्ट काम कर रही है।',
    languageSwitchedText: 'भाषा हिन्दी पर सेट कर दी गई है।',
    puzzleSuccessVoice: 'बहुत खूब! आपने पहेली पूरी कर ली।',
    memorySuccessVoice: 'बधाई हो! आपने सभी जोड़े मिला लिए हैं।',
  },

  as: {
    // Navigation & Role Headers
    monorXur: 'মনৰ সুৰ',
    playerMode: 'প্লেয়াৰ ম’ড • মনৰ অন্বেষক',
    familyPortal: 'পৰিয়াল সংগী প’ৰ্টেল',
    ashaWorker: 'আশা স্বাস্থ্যকৰ্মী',
    caregiverPortal: 'সেৱাযত্নকাৰী প’ৰ্টেল',
    returnToPlayer: 'প্লেয়াৰ ম’ড',
    caregiver: 'সেৱাযত্নকাৰী',
    emergencyCall: 'জৰুৰীকালীন কল',
    setupAndProfiles: 'প্ৰাৰম্ভিক প্ৰস্তুতি আৰু প্ৰ’ফাইল',
    goBack: 'উভতি যাওক',

    // Bottom Navigation
    navHome: 'ঘৰ',
    navPlay: 'খেলক',
    navMemories: 'স্মৃতিমালা',
    navSettings: 'ছেটিংছ',
    navInsights: 'অন্তৰ্দৃষ্টি',
    navProgress: 'অগ্ৰগতি',
    navCalendar: 'কেলেণ্ডাৰ',
    navAlerts: 'সতৰ্কবাৰ্তা',
    navProfile: 'প্ৰ’ফাইল',
    navReport: 'প্ৰতিবেদন',
    navTasks: 'কামকাজ',

    // Patient Home
    activeSession: 'সক্ৰিয় অধিবেশন',
    hello: 'নমস্কাৰ, {name}!',
    helloWelcome: 'নমস্কাৰ, স্বাগতম!',
    playButtonText: 'খেলক',
    playButtonSub: 'খেল আৰম্ভ কৰিবলৈ টিপক',
    tileMemories: 'স্মৃতিমালা',
    tileMemoriesSub: 'পৰিয়াল আৰু আপোন স্মৃতি',
    tileGames: 'খেল আৰু সাঁথৰ',
    tileGamesSub: 'ছবিৰ সাঁথৰ আৰু মনৰ খেল',
    tileRelaxation: 'বিৰাম আৰু শান্তি',
    tileRelaxationSub: 'সুৰীয়া সংগীত আৰু উশাহৰ অভ্যাস',
    tileDailyLife: 'দৈনন্দিন জীৱন',
    tileDailyLifeSub: 'নিয়মীয়া কাম আৰু দিনলিপি',
    upNext: 'পৰৱৰ্তী কাম',
    view: 'চাওক',
    callFamilyPrompt: '{name}ক কল কৰক',
    callFamilyDefault: 'পৰিয়াল / জৰুৰীকালীন কল',
    callFamilySub: 'এটা স্পৰ্শতে আপোনাৰ পৰিয়ালৰ সৈতে সংযোগ কৰক',
    callNow: 'এতিয়াই কল কৰক',

    // Settings
    preferencesTitle: 'খেলুৱৈৰ পছন্দ আৰু ছেটিংছ',
    preferencesSub: 'প্ৰদৰ্শন, শব্দ, ভাষা আৰু খেলৰ পছন্দসমূহ।',
    activePlayer: 'সক্ৰিয় খেলুৱৈ',
    mindExplorerLevel: 'মনৰ অন্বেষক • স্তৰ {level}',
    themeSettingTitle: 'ৰং আৰু সাংস্কৃতিক থিম বাছক',
    themeSettingSub: 'উত্তৰ-পূব ভাৰতৰ ঐতিহ্যময় ৰং অথবা চিৰাচৰিত শান্ত চাহ বাগিচাৰ সেউজীয়া ৰং বাছক।',
    themeDefaultLabel: 'চাহ বাগিচা (চিৰাচৰিত)',
    themeDefaultDesc: 'স্নিগ্ধ চাহ সেউজীয়া, কোমল ক্ৰিম আৰু শান্ত পাহাৰীয়া ৰং।',
    themeNorthEastLabel: 'উত্তৰ-পূব ঐতিহ্য (গামোচা আৰু মুগা)',
    themeNorthEastDesc: 'ফুলাম গামোচাৰ ৰঙা, সোণালী মুগা আৰু হস্ততাঁতৰ সূতাৰ ৰং।',
    languageSettingTitle: 'ভাষা বাছক (Language)',
    languageSettingSub: 'সম্পূৰ্ণ এপৰ ভাষা আৰু কথা কোৱা মাতসমূহ অসমীয়া, ইংৰাজী বা হিন্দীলৈ সলনি কৰক।',
    englishLabel: 'English (ইংৰাজী)',
    hindiLabel: 'हिन्दी (হিন্দী)',
    assameseLabel: 'অসমীয়া (Assamese)',
    activeBadge: 'সক্ৰিয়',
    offlineReadiness: 'অফলাইন প্ৰস্তুতি',
    cloudSynced: 'ক্লাউডত সংৰক্ষিত',
    offlineMode: 'অফলাইন ম’ড',
    serviceWorkerActive: 'চাৰ্ভিচ ৱৰ্কাৰ সক্ৰিয়: ৰোগীৰ তথ্য আৰু দিনলিপি অফলাইন সংৰক্ষিত।',
    cachedLocally: 'স্থানীয়ভাৱে সংৰক্ষিত',
    coreProfile: 'মূল প্ৰ’ফাইল আৰু স্বাস্থ্যৰ স্তৰ',
    todayDailyPlan: 'আজিৰ দিনলিপি আৰু ঔষধ',
    routineItemsCount: '{count} টা নিয়মীয়া কাম',
    installHomeScreen: 'সম্পূৰ্ণ অফলাইন অভিজ্ঞতাৰ বাবে হোম স্ক্ৰীনত যোগ কৰক:',
    extraLargeText: 'ডাঙৰ আকাৰৰ আখৰ',
    extraLargeTextSub: 'বুটাম আৰু কাহিনীৰ বিৱৰণ ডাঙৰ কৰক',
    audioChimes: 'শব্দৰ সংকেত আৰু সুৰ',
    audioChimesSub: 'বুটাম টিপিলে আৰু সঠিক মিলত শান্ত সুৰ',
    testVoiceTitle: 'কথা কোৱা মাত পৰীক্ষা কৰক',
    testVoiceSub: 'কাহিনী কোৱা নমুনা মাত শুনক',
    playSample: 'নমুনা শুনক',
    emergencyContactTitle: 'জৰুৰীকালীন যোগাযোগ',
    emergencyContactUnconfigured: 'সেৱাযত্নকাৰী প’ৰ্টেলত জৰুৰীকালীন যোগাযোগ যোগ কৰক',
    callBtn: 'কল কৰক',
    caregiverDashboardTitle: 'সেৱাযত্নকাৰী প’ৰ্টেল',
    caregiverDashboardSub: 'পৰিয়ালৰ সদস্য আৰু আশা স্বাস্থ্যকৰ্মীৰ বাবে',
    switchToCaregiver: 'সেৱাযত্নকাৰী ম’ডলৈ যাওক →',
    reconfigureProfile: '⚙️ খেলুৱৈ প্ৰ’ফাইল আৰু পিন সলনি কৰক',

    // Games Hub
    gamesHubTitle: 'মনৰ খেলৰ কেন্দ্ৰ',
    gamesHubSub: 'শান্তি আৰু মানসিক সতেজতাৰ বাবে প্ৰস্তুত কৰা সহজ দিহাচৰ্চা।',
    photoPuzzleTitle: 'ছবিৰ সাঁথৰ',
    photoPuzzleDesc: 'পৰিয়ালৰ পুৰণি ছবি আৰু ঐতিহ্যৰ টুকুৰা সংযোগ কৰক।',
    memoryMatchTitle: 'স্মৃতি মিলোৱা খেল',
    memoryMatchDesc: 'পৰম্পৰাগত প্ৰতীক, চাহৰ কাপ আৰু প্ৰকৃতিৰ সঠিক জোৰা বিচাৰক।',
    playNow: 'এতিয়াই খেলক',
    difficultyLabel: 'স্তৰ {level}',
    easy: 'সহজ',
    medium: 'মধ্যমীয়া',
    hard: 'কঠিন',
    backToHome: 'ঘৰলৈ উভতি যাওক',
    gameSessions: 'অধিবেশন',
    gameAccuracy: 'সঠিকতা',

    // Memory Match
    memoryMatchHeader: 'স্মৃতি মিলোৱা খেল',
    pairsFound: 'পোৱা জোৰা',
    moves: 'পদক্ষেপ',
    time: 'সময়',
    hint: 'ইংগিত',
    restart: 'পুনৰ আৰম্ভ কৰক',
    wellDone: 'বৰ সুন্দৰ কাম!',
    completedInMoves: 'আপুনি {moves} টা পদক্ষেপত সকলো জোৰা মিলাই দিলে!',
    nextRound: 'পৰৱৰ্তী ৰাউণ্ড',
    playAgain: 'আকৌ খেলক',

    // Photo Puzzle
    photoPuzzleHeader: 'ছবিৰ সাঁথৰ',
    originalPhoto: 'মূল ছবি',
    viewOriginal: 'সম্পূৰ্ণ ছবি চাওক',
    tilesLeft: 'বাকী থকা টুকুৰা',
    gridSize: 'গ্ৰিডৰ আকাৰ',
    shuffle: 'সানমিহলি কৰক',
    puzzleSolvedTitle: 'সাঁথৰ সমাধান হ’ল!',
    listenToStory: 'কাহিনী শুনক',
    stopVoice: 'মাত বন্ধ কৰক',

    // Daily Life
    dailyLifeTitle: 'আজিৰ দিনলিপি',
    dailyLifeSub: 'আপোনাৰ দিনটোৰ বাবে আৰামদায়ক সময়সূচী আৰু সোঁৱৰণী।',
    allCompleted: 'আজিৰ সকলো কাম সম্পূৰ্ণ হ’ল! বৰ ভাল লাগিল।',
    markDone: 'সম্পূৰ্ণ হ’ল বুলি চিহ্নিত কৰক',
    done: 'হৈ গ’ল',
    morning: 'ৰাতিপুৱা',
    afternoon: 'দুপৰীয়া',
    evening: 'গধূলি',
    night: 'ৰাতি',

    // Relaxation
    relaxationTitle: 'বিৰাম আৰু শান্তি',
    relaxationSub: 'উশাহ-নিশাহৰ অভ্যাস আৰু শান্ত সুৰেৰে মন জুৰাওক।',
    breathingTitle: 'শান্ত উশাহৰ অভ্যাস',
    breathingSub: 'সুৰীয়া ঘণ্টাৰ সৈতে ৪-৪-৪ শান্ত উশাহ-নিশাহৰ চক্ৰ।',
    breatheIn: 'উশাহ ভিতৰলৈ লওক...',
    hold: 'ধৰি ৰাখক...',
    breatheOut: 'উশাহ এৰি দিয়ক...',
    startBreathing: 'উশাহৰ অভ্যাস আৰম্ভ কৰক',
    pauseBreathing: 'ৰখাওক',
    resumeBreathing: 'অব্যাহত ৰাখক',
    musicTitle: 'শান্ত সংগীত আৰু সুৰ',
    musicSub: 'অস্থিৰতা আৰু উদ্বেগ দূৰ কৰা শান্তিময় সংগীত।',
    natureSounds: 'প্ৰকৃতি আৰু চৰাইৰ মাত',
    fluteSounds: 'বাঁহীৰ সুৰ',
    bowlSounds: 'ছিংগিং বাউল (৪৩২ হাৰ্টজ)',
    harpSounds: 'সুৰীয়া বীণা সংগীত',
    playMusic: 'সংগীত বজাওক',
    stopMusic: 'সংগীত বন্ধ কৰক',

    // Memories
    memoriesTitle: 'পৰিয়ালৰ স্মৃতিমালা',
    memoriesSub: 'আপোন ছবি, স্থান আৰু আপোনজনৰ মাতৰ কাহিনী।',
    recordMemory: 'আপোনাৰ মাতত স্মৃতি যোগ কৰক',
    allMemories: 'সকলো স্মৃতি',
    familyTag: 'পৰিয়াল',
    placesTag: 'স্থান',
    cultureTag: 'সংস্কৃতি',
    dailyTag: 'দৈনন্দিন জীৱন',
    previous: 'পূৰ্বৱৰ্তী',
    next: 'পৰৱৰ্তী',
    close: 'বন্ধ কৰক',
    back: 'উভতি যাওক',
    cancel: 'বাতিল কৰক',

    // Audio Diary
    audioDiaryTitle: 'কণ্ঠৰ ডায়েৰী',
    audioDiarySub: 'আপোনাৰ দিনটো বা কোনো বিশেষ স্মৃতিৰ বিষয়ে মন খুলি কওক।',
    tapToSpeak: 'ক’বলৈ টিপক',
    stopRecording: 'ৰেকৰ্ডিং সমাপ্ত কৰক',
    listeningVoice: 'আপোনাৰ মাত শুনা হৈছে...',
    readyToRecord: 'ৰেকৰ্ড কৰিবলৈ সাজু',
    voiceRecorded: 'মাত ৰেকৰ্ড হ’ল',
    playAudio: 'মাত শুনক',
    saveToMemories: 'স্মৃতিত সাঁচি ৰাখক',

    // Spoken System Voice Text
    welcomeVoiceText: 'মনৰ সুৰলৈ আপোনাক স্বাগতম, {name}!',
    testVoiceSpeechText: 'নমস্কাৰ {name}। কথা কোৱা মাত স্পষ্টভাৱে চলি আছে।',
    languageSwitchedText: 'ভাষা অসমীয়ালৈ নিৰ্ধাৰণ কৰা হ’ল।',
    puzzleSuccessVoice: 'বৰ সুন্দৰ কাম! আপুনি সাঁথৰটো সম্পূৰ্ণ কৰিলে।',
    memorySuccessVoice: 'অভিনন্দন! আপুনি সকলো জোৰা অতি ধুনীয়াকৈ মিলাই দিলে।',
  },
};

/**
 * Helper to interpolate translation strings with parameters like {name} or {count}
 */
export function formatTranslation(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return Object.entries(params).reduce((acc, [key, val]) => {
    return acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
  }, template);
}
