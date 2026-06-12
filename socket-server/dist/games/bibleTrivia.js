"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEST_TRIVIA_QUESTIONS = exports.TRIVIA_QUESTIONS = void 0;
exports.pickQuestions = pickQuestions;
exports.TRIVIA_QUESTIONS = [
    // ── Old Testament ──────────────────────────────────────────────
    {
        id: 'ot-01', category: 'Old Testament', points: 3,
        question: 'How many days did it rain during the flood in Noah\'s time?',
        options: ['20 days', '40 days', '60 days', '100 days'],
        answer: 'B',
    },
    {
        id: 'ot-02', category: 'Old Testament', points: 3,
        question: 'Who was thrown into a den of lions?',
        options: ['Shadrach', 'Elijah', 'Daniel', 'Ezekiel'],
        answer: 'C',
    },
    {
        id: 'ot-03', category: 'Old Testament', points: 5,
        question: 'Which judge of Israel had 70 sons?',
        options: ['Gideon', 'Samson', 'Jephthah', 'Deborah'],
        answer: 'A',
    },
    {
        id: 'ot-04', category: 'Old Testament', points: 3,
        question: 'What was the first plague God sent on Egypt?',
        options: ['Frogs', 'Darkness', 'Water turned to blood', 'Locusts'],
        answer: 'C',
    },
    {
        id: 'ot-05', category: 'Old Testament', points: 5,
        question: 'How old was Moses when he died?',
        options: ['100 years', '120 years', '130 years', '150 years'],
        answer: 'B',
    },
    {
        id: 'ot-06', category: 'Old Testament', points: 5,
        question: 'Who was the first king of Israel?',
        options: ['David', 'Solomon', 'Saul', 'Samuel'],
        answer: 'C',
    },
    {
        id: 'ot-07', category: 'Old Testament', points: 7,
        question: 'How many years did Solomon reign over Israel?',
        options: ['30 years', '40 years', '50 years', '60 years'],
        answer: 'B',
    },
    {
        id: 'ot-08', category: 'Old Testament', points: 3,
        question: 'Who built the first temple in Jerusalem?',
        options: ['David', 'Solomon', 'Nehemiah', 'Ezra'],
        answer: 'B',
    },
    {
        id: 'ot-09', category: 'Old Testament', points: 5,
        question: 'In what river was Naaman told to wash to be healed of leprosy?',
        options: ['River Nile', 'River Jordan', 'River Euphrates', 'River Abana'],
        answer: 'B',
    },
    {
        id: 'ot-10', category: 'Old Testament', points: 7,
        question: 'Who was Esther\'s cousin who raised her?',
        options: ['Nehemiah', 'Mordecai', 'Haman', 'Zerubbabel'],
        answer: 'B',
    },
    // ── New Testament ──────────────────────────────────────────────
    {
        id: 'nt-01', category: 'New Testament', points: 3,
        question: 'What was Jesus\' first miracle?',
        options: ['Feeding 5,000', 'Healing a blind man', 'Turning water into wine', 'Walking on water'],
        answer: 'C',
    },
    {
        id: 'nt-02', category: 'New Testament', points: 3,
        question: 'For how many days did Jesus fast in the wilderness?',
        options: ['30 days', '40 days', '20 days', '7 days'],
        answer: 'B',
    },
    {
        id: 'nt-03', category: 'New Testament', points: 5,
        question: 'Who baptised Jesus?',
        options: ['Peter', 'James', 'John the Baptist', 'Elijah'],
        answer: 'C',
    },
    {
        id: 'nt-04', category: 'New Testament', points: 3,
        question: 'How many loaves of bread were used to feed 5,000 people?',
        options: ['2', '3', '5', '7'],
        answer: 'C',
    },
    {
        id: 'nt-05', category: 'New Testament', points: 5,
        question: 'Who denied Jesus three times?',
        options: ['James', 'John', 'Thomas', 'Peter'],
        answer: 'D',
    },
    {
        id: 'nt-06', category: 'New Testament', points: 5,
        question: 'What was the name of the man Jesus raised from the dead after 4 days?',
        options: ['Jairus', 'Lazarus', 'Bartimaeus', 'Zacchaeus'],
        answer: 'B',
    },
    {
        id: 'nt-07', category: 'New Testament', points: 7,
        question: 'How many pieces of silver did Judas receive for betraying Jesus?',
        options: ['20', '25', '30', '50'],
        answer: 'C',
    },
    {
        id: 'nt-08', category: 'New Testament', points: 3,
        question: 'On what day did Jesus rise from the dead?',
        options: ['First day', 'Second day', 'Third day', 'Fourth day'],
        answer: 'C',
    },
    {
        id: 'nt-09', category: 'New Testament', points: 5,
        question: 'Who was the first martyr of the Christian church?',
        options: ['James', 'Stephen', 'Philip', 'Paul'],
        answer: 'B',
    },
    {
        id: 'nt-10', category: 'New Testament', points: 7,
        question: 'Which city was Paul travelling to when he was converted?',
        options: ['Jerusalem', 'Athens', 'Damascus', 'Corinth'],
        answer: 'C',
    },
    // ── Books of the Bible ─────────────────────────────────────────
    {
        id: 'bb-01', category: 'Books of the Bible', points: 3,
        question: 'How many books are in the New Testament?',
        options: ['24', '27', '30', '39'],
        answer: 'B',
    },
    {
        id: 'bb-02', category: 'Books of the Bible', points: 3,
        question: 'Which is the shortest book in the Bible?',
        options: ['Jude', '3 John', 'Philemon', 'Obadiah'],
        answer: 'B',
    },
    {
        id: 'bb-03', category: 'Books of the Bible', points: 5,
        question: 'Which book of the Bible has the most chapters?',
        options: ['Isaiah', 'Jeremiah', 'Psalms', 'Genesis'],
        answer: 'C',
    },
    {
        id: 'bb-04', category: 'Books of the Bible', points: 5,
        question: 'How many books did Paul write in the New Testament?',
        options: ['10', '11', '13', '15'],
        answer: 'C',
    },
    {
        id: 'bb-05', category: 'Books of the Bible', points: 7,
        question: 'Which book of the Bible does not mention God by name?',
        options: ['Ecclesiastes', 'Song of Solomon', 'Esther', 'Ruth'],
        answer: 'C',
    },
    // ── Life of Jesus ──────────────────────────────────────────────
    {
        id: 'lj-01', category: 'Life of Jesus', points: 3,
        question: 'In which city was Jesus born?',
        options: ['Nazareth', 'Jerusalem', 'Bethlehem', 'Jericho'],
        answer: 'C',
    },
    {
        id: 'lj-02', category: 'Life of Jesus', points: 3,
        question: 'How old was Jesus when he began his ministry?',
        options: ['25', '30', '33', '35'],
        answer: 'B',
    },
    {
        id: 'lj-03', category: 'Life of Jesus', points: 5,
        question: 'How many disciples did Jesus choose?',
        options: ['10', '11', '12', '70'],
        answer: 'C',
    },
    {
        id: 'lj-04', category: 'Life of Jesus', points: 5,
        question: 'What was Jesus\' earthly father\'s name?',
        options: ['John', 'Zechariah', 'Joseph', 'Simeon'],
        answer: 'C',
    },
    {
        id: 'lj-05', category: 'Life of Jesus', points: 7,
        question: 'On which mountain was Jesus transfigured?',
        options: ['Mount Sinai', 'Mount Hermon', 'Mount Tabor', 'Mount of Olives'],
        answer: 'C',
    },
    // ── Psalms & Wisdom ────────────────────────────────────────────
    {
        id: 'ps-01', category: 'Psalms & Wisdom', points: 3,
        question: 'Who wrote most of the book of Psalms?',
        options: ['Solomon', 'Moses', 'David', 'Asaph'],
        answer: 'C',
    },
    {
        id: 'ps-02', category: 'Psalms & Wisdom', points: 3,
        question: 'What is the longest chapter in the Bible?',
        options: ['Psalm 23', 'Psalm 119', 'Proverbs 31', 'Isaiah 53'],
        answer: 'B',
    },
    {
        id: 'ps-03', category: 'Psalms & Wisdom', points: 5,
        question: 'Who wrote the book of Proverbs primarily?',
        options: ['David', 'Ezra', 'Solomon', 'Moses'],
        answer: 'C',
    },
    {
        id: 'ps-04', category: 'Psalms & Wisdom', points: 5,
        question: 'What does "Selah" mean in the Psalms?',
        options: ['Amen', 'Praise the Lord', 'A musical pause', 'Forever'],
        answer: 'C',
    },
    // ── Prophets ───────────────────────────────────────────────────
    {
        id: 'pr-01', category: 'Prophets', points: 3,
        question: 'Which prophet was swallowed by a great fish?',
        options: ['Elijah', 'Jonah', 'Amos', 'Hosea'],
        answer: 'B',
    },
    {
        id: 'pr-02', category: 'Prophets', points: 5,
        question: 'How many major prophets are in the Old Testament?',
        options: ['3', '4', '5', '7'],
        answer: 'C',
    },
    {
        id: 'pr-03', category: 'Prophets', points: 5,
        question: 'Which prophet saw the valley of dry bones?',
        options: ['Isaiah', 'Jeremiah', 'Ezekiel', 'Daniel'],
        answer: 'C',
    },
    {
        id: 'pr-04', category: 'Prophets', points: 7,
        question: 'Who prophesied "For unto us a child is born, unto us a son is given"?',
        options: ['Jeremiah', 'Isaiah', 'Micah', 'Zechariah'],
        answer: 'B',
    },
    // ── General ────────────────────────────────────────────────────
    {
        id: 'gn-01', category: 'General', points: 3,
        question: 'What are the first four words of the Bible?',
        options: ['God created the heavens', 'In the beginning God', 'The Lord is great', 'In the beginning was'],
        answer: 'B',
    },
    {
        id: 'gn-02', category: 'General', points: 3,
        question: 'What is the Golden Rule?',
        options: ['Love God above all', 'Do to others what you want done to you', 'Fear God and keep commandments', 'The Lord is my shepherd'],
        answer: 'B',
    },
    {
        id: 'gn-03', category: 'General', points: 5,
        question: 'What is the last word of the Bible?',
        options: ['Amen', 'Hallelujah', 'Lord', 'Grace'],
        answer: 'A',
    },
    {
        id: 'gn-04', category: 'General', points: 5,
        question: 'Which fruit did Eve eat in the Garden of Eden?',
        options: ['Apple (the Bible says "fruit")', 'Pomegranate', 'Fig', 'Grape'],
        answer: 'A',
    },
    {
        id: 'gn-05', category: 'General', points: 7,
        question: 'How many times does the word "God" appear in Genesis chapter 1?',
        options: ['20', '25', '32', '35'],
        answer: 'C',
    },
    {
        id: 'gn-06', category: 'General', points: 3,
        question: 'What language was most of the New Testament originally written in?',
        options: ['Latin', 'Hebrew', 'Aramaic', 'Greek'],
        answer: 'D',
    },
    {
        id: 'gn-07', category: 'General', points: 5,
        question: 'Which disciple walked on water with Jesus?',
        options: ['James', 'John', 'Andrew', 'Peter'],
        answer: 'D',
    },
    {
        id: 'gn-08', category: 'General', points: 5,
        question: 'What does "Hallelujah" mean?',
        options: ['God is good', 'Praise the Lord', 'Thank you Lord', 'Bless the Lord'],
        answer: 'B',
    },
];
// ── Test-only questions ────────────────────────────────────────────
// IDs prefixed with "test-" so they are NEVER included in TRIVIA_QUESTION_IDS
// and can never be assigned to a real tournament session.
exports.TEST_TRIVIA_QUESTIONS = [
    {
        id: 'test-01', category: 'Test', points: 3,
        question: 'What is the first book of the Bible?',
        options: ['Exodus', 'Genesis', 'Numbers', 'Leviticus'],
        answer: 'B',
    },
    {
        id: 'test-02', category: 'Test', points: 3,
        question: 'How many books are in the Bible?',
        options: ['60', '63', '66', '70'],
        answer: 'C',
    },
    {
        id: 'test-03', category: 'Test', points: 3,
        question: 'Who was the first man God created?',
        options: ['Noah', 'Moses', 'Abraham', 'Adam'],
        answer: 'D',
    },
    {
        id: 'test-04', category: 'Test', points: 3,
        question: 'What is the last book of the Bible?',
        options: ['Jude', 'Hebrews', 'Revelation', 'Acts'],
        answer: 'C',
    },
    {
        id: 'test-05', category: 'Test', points: 3,
        question: 'Who built the ark?',
        options: ['Moses', 'Abraham', 'David', 'Noah'],
        answer: 'D',
    },
    {
        id: 'test-06', category: 'Test', points: 3,
        question: 'Who led Israel out of Egypt?',
        options: ['Joshua', 'Moses', 'Aaron', 'Samuel'],
        answer: 'B',
    },
    {
        id: 'test-07', category: 'Test', points: 3,
        question: 'In which city was Jesus born?',
        options: ['Nazareth', 'Jerusalem', 'Bethlehem', 'Jericho'],
        answer: 'C',
    },
    {
        id: 'test-08', category: 'Test', points: 3,
        question: 'Who was the strongest man in the Bible?',
        options: ['David', 'Goliath', 'Samson', 'Solomon'],
        answer: 'C',
    },
    {
        id: 'test-09', category: 'Test', points: 3,
        question: 'On which day did God rest after creation?',
        options: ['Fifth day', 'Sixth day', 'Seventh day', 'Eighth day'],
        answer: 'C',
    },
    {
        id: 'test-10', category: 'Test', points: 3,
        question: 'Which disciple denied Jesus three times?',
        options: ['James', 'John', 'Thomas', 'Peter'],
        answer: 'D',
    },
    {
        id: 'test-11', category: 'Test', points: 3,
        question: 'What was Jesus\' first miracle?',
        options: ['Healing a blind man', 'Raising Lazarus', 'Turning water into wine', 'Walking on water'],
        answer: 'C',
    },
    {
        id: 'test-12', category: 'Test', points: 3,
        question: 'How many disciples did Jesus choose?',
        options: ['7', '10', '12', '70'],
        answer: 'C',
    },
];
// Tournament pool — excludes test-only questions
function pickQuestions(count) {
    const pool = exports.TRIVIA_QUESTIONS.filter(q => !q.id.startsWith('test-'));
    return [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(count, pool.length));
}
