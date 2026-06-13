export interface TriviaQuestion {
  id: string;
  question: string;
  options: [string, string, string, string]; // A, B, C, D
  answer: 'A' | 'B' | 'C' | 'D';
  category: string;
  points: number; // 3 = easy, 5 = medium, 7 = hard
}

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
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

  // ── Old Testament (Expansion) ──────────────────────────────────
  {
    id: 'ot-11', category: 'Old Testament', points: 3,
    question: 'How many years did the Israelites wander in the wilderness?',
    options: ['20 years', '30 years', '40 years', '50 years'],
    answer: 'C',
  },
  {
    id: 'ot-12', category: 'Old Testament', points: 3,
    question: 'Which son of Jacob was sold into slavery by his brothers?',
    options: ['Moses', 'Samson', 'Benjamin', 'Joseph'],
    answer: 'D',
  },
  {
    id: 'ot-13', category: 'Old Testament', points: 3,
    question: 'Which city\'s walls fell after Israel marched around them for seven days?',
    options: ['Bethlehem', 'Jericho', 'Samaria', 'Hebron'],
    answer: 'B',
  },
  {
    id: 'ot-14', category: 'Old Testament', points: 3,
    question: 'How many Psalms are in the Bible?',
    options: ['120', '135', '150', '165'],
    answer: 'C',
  },
  {
    id: 'ot-15', category: 'Old Testament', points: 5,
    question: 'Which prophet confronted King David about his sin with Bathsheba?',
    options: ['Samuel', 'Elijah', 'Isaiah', 'Nathan'],
    answer: 'D',
  },
  {
    id: 'ot-16', category: 'Old Testament', points: 5,
    question: 'What was the name of David\'s closest friend, son of King Saul?',
    options: ['Absalom', 'Joab', 'Jonathan', 'Ahithophel'],
    answer: 'C',
  },
  {
    id: 'ot-17', category: 'Old Testament', points: 3,
    question: 'Which three young men were thrown into a fiery furnace in Babylon?',
    options: ['Daniel, Elijah and Elisha', 'Shadrach, Meshach and Abednego', 'Moses, Aaron and Miriam', 'Reuben, Simeon and Levi'],
    answer: 'B',
  },
  {
    id: 'ot-18', category: 'Old Testament', points: 5,
    question: 'How old was Methuselah when he died, making him the oldest person in the Bible?',
    options: ['850 years', '900 years', '930 years', '969 years'],
    answer: 'D',
  },
  {
    id: 'ot-19', category: 'Old Testament', points: 3,
    question: 'What sign did God give Noah as a promise never to flood the whole earth again?',
    options: ['A dove', 'A star', 'A rainbow', 'A burning bush'],
    answer: 'C',
  },
  {
    id: 'ot-20', category: 'Old Testament', points: 7,
    question: 'What was the name of Moses\' wife?',
    options: ['Miriam', 'Zipporah', 'Rahab', 'Deborah'],
    answer: 'B',
  },

  // ── New Testament (Expansion) ──────────────────────────────────
  {
    id: 'nt-11', category: 'New Testament', points: 3,
    question: 'What was the Apostle Paul\'s original name?',
    options: ['Barnabas', 'Silas', 'Saul', 'Philip'],
    answer: 'C',
  },
  {
    id: 'nt-12', category: 'New Testament', points: 3,
    question: 'Who wrote the book of Revelation?',
    options: ['Paul', 'Peter', 'James', 'John'],
    answer: 'D',
  },
  {
    id: 'nt-13', category: 'New Testament', points: 7,
    question: 'How many fish did the disciples catch when Jesus told them to cast the net on the right side?',
    options: ['100', '120', '153', '200'],
    answer: 'C',
  },
  {
    id: 'nt-14', category: 'New Testament', points: 5,
    question: 'Who helped Jesus carry His cross on the way to Calvary?',
    options: ['John', 'Simon of Cyrene', 'Joseph of Arimathea', 'Barnabas'],
    answer: 'B',
  },
  {
    id: 'nt-15', category: 'New Testament', points: 5,
    question: 'What was the name of the tax collector who climbed a tree to see Jesus?',
    options: ['Matthew', 'Levi', 'Bartimaeus', 'Zacchaeus'],
    answer: 'D',
  },
  {
    id: 'nt-16', category: 'New Testament', points: 5,
    question: 'How many days passed between Jesus\' resurrection and His ascension into heaven?',
    options: ['7 days', '14 days', '40 days', '50 days'],
    answer: 'C',
  },
  {
    id: 'nt-17', category: 'New Testament', points: 3,
    question: 'Who was the Roman governor who sentenced Jesus to be crucified?',
    options: ['Herod', 'Caesar', 'Pontius Pilate', 'Caiaphas'],
    answer: 'C',
  },
  {
    id: 'nt-18', category: 'New Testament', points: 3,
    question: 'What was the name of the angel who announced to Mary she would bear the Son of God?',
    options: ['Michael', 'Raphael', 'Uriel', 'Gabriel'],
    answer: 'D',
  },
  {
    id: 'nt-19', category: 'New Testament', points: 3,
    question: 'On which Jewish feast day did the Holy Spirit descend on the disciples?',
    options: ['Passover', 'Pentecost', 'Tabernacles', 'Day of Atonement'],
    answer: 'B',
  },

  // ── Books of the Bible (Expansion) ────────────────────────────
  {
    id: 'bb-06', category: 'Books of the Bible', points: 3,
    question: 'How many books are in the Old Testament?',
    options: ['33', '36', '39', '42'],
    answer: 'C',
  },
  {
    id: 'bb-07', category: 'Books of the Bible', points: 3,
    question: 'How many books are in the entire Bible?',
    options: ['60', '63', '66', '70'],
    answer: 'C',
  },
  {
    id: 'bb-08', category: 'Books of the Bible', points: 5,
    question: 'Who wrote the Acts of the Apostles?',
    options: ['Paul', 'Peter', 'Mark', 'Luke'],
    answer: 'D',
  },
  {
    id: 'bb-09', category: 'Books of the Bible', points: 5,
    question: 'Which Gospel was written by a physician?',
    options: ['Matthew', 'Mark', 'Luke', 'John'],
    answer: 'C',
  },
  {
    id: 'bb-10', category: 'Books of the Bible', points: 3,
    question: 'How many books make up the Pentateuch (Books of Moses)?',
    options: ['3', '4', '5', '7'],
    answer: 'C',
  },

  // ── Life of Jesus (Expansion) ──────────────────────────────────
  {
    id: 'lj-06', category: 'Life of Jesus', points: 3,
    question: 'What was Jesus\' occupation before He began His public ministry?',
    options: ['Fisherman', 'Shepherd', 'Carpenter', 'Tent-maker'],
    answer: 'C',
  },
  {
    id: 'lj-07', category: 'Life of Jesus', points: 5,
    question: 'In which garden was Jesus arrested by soldiers?',
    options: ['Garden of Eden', 'Garden of Gethsemane', 'Garden of Joseph', 'Garden of Olives'],
    answer: 'B',
  },
  {
    id: 'lj-08', category: 'Life of Jesus', points: 3,
    question: 'Who came from the East, guided by a star, to worship the baby Jesus?',
    options: ['Shepherds', 'Angels', 'Wise Men / Magi', 'Pharisees'],
    answer: 'C',
  },
  {
    id: 'lj-09', category: 'Life of Jesus', points: 3,
    question: 'How many times was Jesus tempted by the devil in the wilderness?',
    options: ['Once', 'Twice', 'Three times', 'Seven times'],
    answer: 'C',
  },
  {
    id: 'lj-10', category: 'Life of Jesus', points: 5,
    question: 'On which hill was Jesus crucified?',
    options: ['Mount of Olives', 'Mount Sinai', 'Golgotha', 'Mount Carmel'],
    answer: 'C',
  },

  // ── Psalms & Wisdom (Expansion) ────────────────────────────────
  {
    id: 'ps-05', category: 'Psalms & Wisdom', points: 7,
    question: 'How many verses are in Psalm 119, the longest chapter in the Bible?',
    options: ['144', '160', '172', '176'],
    answer: 'D',
  },
  {
    id: 'ps-06', category: 'Psalms & Wisdom', points: 5,
    question: 'Which book contains the phrase "Vanity of vanities, all is vanity"?',
    options: ['Proverbs', 'Job', 'Ecclesiastes', 'Psalms'],
    answer: 'C',
  },
  {
    id: 'ps-07', category: 'Psalms & Wisdom', points: 3,
    question: 'What is the primary theme of the book of Job?',
    options: ['Prayer', 'Suffering and faith', 'Marriage and family', 'Seeking wisdom'],
    answer: 'B',
  },
  {
    id: 'ps-08', category: 'Psalms & Wisdom', points: 5,
    question: 'According to Proverbs, what is the beginning of wisdom?',
    options: ['Reading the scriptures', 'The fear of the Lord', 'Seeking wise counsel', 'A humble heart'],
    answer: 'B',
  },
  {
    id: 'ps-09', category: 'Psalms & Wisdom', points: 3,
    question: 'In which book do we find "The Lord is my shepherd; I shall not want"?',
    options: ['Proverbs', 'Isaiah', 'Psalms', 'Job'],
    answer: 'C',
  },

  // ── Prophets (Expansion) ───────────────────────────────────────
  {
    id: 'pr-05', category: 'Prophets', points: 3,
    question: 'Which prophet was taken up to heaven in a chariot of fire?',
    options: ['Elisha', 'Elijah', 'Enoch', 'Isaiah'],
    answer: 'B',
  },
  {
    id: 'pr-06', category: 'Prophets', points: 3,
    question: 'Who succeeded the prophet Elijah?',
    options: ['Amos', 'Hosea', 'Elisha', 'Micah'],
    answer: 'C',
  },
  {
    id: 'pr-07', category: 'Prophets', points: 5,
    question: 'Which prophet was commanded by God to marry an unfaithful wife as a sign to Israel?',
    options: ['Jeremiah', 'Ezekiel', 'Amos', 'Hosea'],
    answer: 'D',
  },
  {
    id: 'pr-08', category: 'Prophets', points: 5,
    question: 'Which prophet was thrown into a muddy cistern by his own people?',
    options: ['Isaiah', 'Jeremiah', 'Ezekiel', 'Daniel'],
    answer: 'B',
  },
  {
    id: 'pr-09', category: 'Prophets', points: 7,
    question: 'Which Minor Prophet wrote specifically about the coming destruction of Nineveh?',
    options: ['Amos', 'Micah', 'Nahum', 'Habakkuk'],
    answer: 'C',
  },

  // ── General (Expansion) ────────────────────────────────────────
  {
    id: 'gn-09', category: 'General', points: 3,
    question: 'Which two words make up the shortest verse in the Bible (John 11:35)?',
    options: ['"God spoke"', '"Jesus wept"', '"He arose"', '"Be still"'],
    answer: 'B',
  },
  {
    id: 'gn-10', category: 'General', points: 7,
    question: 'What type of wood was Noah\'s ark made from?',
    options: ['Cedar wood', 'Olive wood', 'Gopher wood', 'Acacia wood'],
    answer: 'C',
  },
  {
    id: 'gn-11', category: 'General', points: 5,
    question: 'How many brothers did Joseph (son of Jacob) have?',
    options: ['9', '10', '11', '12'],
    answer: 'C',
  },
  {
    id: 'gn-12', category: 'General', points: 3,
    question: 'Who is the oldest person recorded in the Bible, dying at 969 years old?',
    options: ['Adam', 'Noah', 'Enoch', 'Methuselah'],
    answer: 'D',
  },
  {
    id: 'gn-13', category: 'General', points: 5,
    question: 'What did Samson use to kill a thousand Philistines?',
    options: ['A sword', 'A spear', 'The jawbone of a donkey', 'A large stone'],
    answer: 'C',
  },
  {
    id: 'gn-14', category: 'General', points: 3,
    question: 'What was the name of Abraham\'s first son?',
    options: ['Isaac', 'Jacob', 'Ishmael', 'Esau'],
    answer: 'C',
  },
  {
    id: 'gn-15', category: 'General', points: 3,
    question: 'In which language was most of the Old Testament originally written?',
    options: ['Aramaic', 'Latin', 'Greek', 'Hebrew'],
    answer: 'D',
  },
];

// ── Test-only questions ────────────────────────────────────────────
// IDs prefixed with "test-" so they are NEVER included in TRIVIA_QUESTION_IDS
// and can never be assigned to a real tournament session.
export const TEST_TRIVIA_QUESTIONS: TriviaQuestion[] = [
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
export function pickQuestions(count: number): TriviaQuestion[] {
  const pool = TRIVIA_QUESTIONS.filter(q => !q.id.startsWith('test-'));
  return [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(count, pool.length));
}
