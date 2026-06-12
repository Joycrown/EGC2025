"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEST_WORD_BANK_WORDS = exports.WORD_BANK = void 0;
exports.pickRandomWord = pickRandomWord;
exports.maskWord = maskWord;
exports.revealLetters = revealLetters;
exports.checkLetter = checkLetter;
exports.isWordSolved = isWordSolved;
exports.initHangmanState = initHangmanState;
exports.toClientState = toClientState;
const WORD_BANK = [
    // Prophets
    { word: 'ISAIAH', category: 'Prophet', hint: 'Wrote about the suffering servant' },
    { word: 'JEREMIAH', category: 'Prophet', hint: 'Known as the weeping prophet' },
    { word: 'EZEKIEL', category: 'Prophet', hint: 'Had a vision of a valley of dry bones' },
    { word: 'DANIEL', category: 'Prophet', hint: 'Survived the lions den' },
    { word: 'ELIJAH', category: 'Prophet', hint: 'Fed by ravens, confronted Baal prophets' },
    { word: 'ELISHA', category: 'Prophet', hint: 'Received a double portion of Elijah\'s spirit' },
    { word: 'HOSEA', category: 'Prophet', hint: 'Married an unfaithful wife as a sign to Israel' },
    { word: 'AMOS', category: 'Prophet', hint: 'A shepherd called to prophesy in Israel' },
    { word: 'MICAH', category: 'Prophet', hint: 'Predicted Christ\'s birth in Bethlehem' },
    { word: 'MALACHI', category: 'Prophet', hint: 'The last book of the Old Testament' },
    { word: 'NAHUM', category: 'Prophet', hint: 'Prophesied the fall of Nineveh' },
    { word: 'HABAKKUK', category: 'Prophet', hint: 'Asked God "How long?" and waited for an answer' },
    { word: 'ZECHARIAH', category: 'Prophet', hint: 'Had eight visions, spoke of a coming King on a donkey' },
    // People
    { word: 'MOSES', category: 'Bible Person', hint: 'Led Israel out of Egypt, parted the Red Sea' },
    { word: 'ABRAHAM', category: 'Bible Person', hint: 'Father of faith, left Ur for Canaan' },
    { word: 'SOLOMON', category: 'Bible Person', hint: 'The wisest king, built the first temple' },
    { word: 'JOSEPH', category: 'Bible Person', hint: 'Had a coat of many colours, interpreted dreams' },
    { word: 'JOSHUA', category: 'Bible Person', hint: 'Led Israel into the Promised Land' },
    { word: 'NEHEMIAH', category: 'Bible Person', hint: 'Rebuilt the walls of Jerusalem' },
    { word: 'ESTHER', category: 'Bible Person', hint: 'A queen who saved her people from destruction' },
    { word: 'RUTH', category: 'Bible Person', hint: 'Said "Where you go I will go" to her mother-in-law' },
    { word: 'DEBORAH', category: 'Bible Person', hint: 'A judge and prophetess of Israel' },
    { word: 'GIDEON', category: 'Bible Person', hint: 'Defeated 135,000 Midianites with 300 men' },
    { word: 'SAMSON', category: 'Bible Person', hint: 'His strength was in his uncut hair' },
    { word: 'GOLIATH', category: 'Bible Person', hint: 'A Philistine giant defeated by a shepherd boy' },
    { word: 'BARNABAS', category: 'Bible Person', hint: 'Paul\'s companion, his name means son of encouragement' },
    { word: 'CORNELIUS', category: 'Bible Person', hint: 'The first Gentile to receive the Holy Spirit' },
    // Places
    { word: 'JERUSALEM', category: 'Bible Place', hint: 'The holy city, city of David' },
    { word: 'BETHLEHEM', category: 'Bible Place', hint: 'Where Jesus was born, city of David' },
    { word: 'NAZARETH', category: 'Bible Place', hint: 'Where Jesus grew up' },
    { word: 'JERICHO', category: 'Bible Place', hint: 'Its walls fell when Israel marched and shouted' },
    { word: 'GALILEE', category: 'Bible Place', hint: 'The sea where Jesus walked on water' },
    { word: 'GETHSEMANE', category: 'Bible Place', hint: 'The garden where Jesus prayed before His arrest' },
    { word: 'CALVARY', category: 'Bible Place', hint: 'The hill where Jesus was crucified' },
    { word: 'BETHANY', category: 'Bible Place', hint: 'Where Lazarus was raised from the dead' },
    { word: 'CAPERNAUM', category: 'Bible Place', hint: 'Jesus\'s base of ministry in Galilee' },
    { word: 'SAMARIA', category: 'Bible Place', hint: 'Jesus spoke to a woman at the well here' },
    { word: 'SINAI', category: 'Bible Place', hint: 'The mountain where Moses received the Ten Commandments' },
    { word: 'ANTIOCH', category: 'Bible Place', hint: 'Where believers were first called Christians' },
    // Concepts & Theology
    { word: 'SALVATION', category: 'Bible Concept', hint: 'Being saved from sin and its consequences' },
    { word: 'REDEMPTION', category: 'Bible Concept', hint: 'Being bought back or set free at a price' },
    { word: 'COVENANT', category: 'Bible Concept', hint: 'A binding agreement between God and His people' },
    { word: 'BAPTISM', category: 'Bible Concept', hint: 'A public declaration of faith through water' },
    { word: 'RESURRECTION', category: 'Bible Concept', hint: 'Rising from the dead' },
    { word: 'SANCTIFICATION', category: 'Bible Concept', hint: 'The process of being made holy' },
    { word: 'COMMUNION', category: 'Bible Concept', hint: 'The Lord\'s Supper: bread and wine in remembrance' },
    { word: 'ATONEMENT', category: 'Bible Concept', hint: 'Making amends for sin, Jesus as our substitute' },
    { word: 'JUSTIFICATION', category: 'Bible Concept', hint: 'Being declared righteous before God' },
    { word: 'INTERCESSION', category: 'Bible Concept', hint: 'Praying on behalf of others' },
    { word: 'REVELATION', category: 'Bible Concept', hint: 'God making Himself and His will known; also the last book' },
    { word: 'CONSECRATION', category: 'Bible Concept', hint: 'Setting apart for God\'s holy purposes' },
    // Events
    { word: 'EXODUS', category: 'Bible Event', hint: 'The departure of Israel from Egypt' },
    { word: 'CRUCIFIXION', category: 'Bible Event', hint: 'The death of Jesus on the cross' },
    { word: 'PENTECOST', category: 'Bible Event', hint: 'The outpouring of the Holy Spirit on the disciples' },
    { word: 'TRANSFIGURATION', category: 'Bible Event', hint: 'Jesus glowed on a mountain with Moses and Elijah' },
    { word: 'ANNUNCIATION', category: 'Bible Event', hint: 'The angel Gabriel\'s message to Mary' },
    { word: 'ASCENSION', category: 'Bible Event', hint: 'Jesus rising into heaven after resurrection' },
    // --- Additional Prophets ---
    { word: 'OBADIAH', category: 'Prophet', hint: 'Shortest book in the Old Testament, about Edom' },
    { word: 'JOEL', category: 'Prophet', hint: 'Prophesied the outpouring of the Spirit on all flesh' },
    { word: 'JONAH', category: 'Prophet', hint: 'Spent three days inside a great fish' },
    { word: 'ZEPHANIAH', category: 'Prophet', hint: 'Prophesied the great Day of the Lord' },
    { word: 'HAGGAI', category: 'Prophet', hint: 'Urged Israel to rebuild the temple after exile' },
    { word: 'SAMUEL', category: 'Prophet', hint: 'Anointed both Saul and David as king' },
    { word: 'NATHAN', category: 'Prophet', hint: 'Confronted David with a parable about a stolen lamb' },
    { word: 'HULDAH', category: 'Prophet', hint: 'A prophetess who confirmed the Book of the Law' },
    { word: 'MIRIAM', category: 'Prophet', hint: 'Sister of Moses who led women in song after the Red Sea' },
    { word: 'AGABUS', category: 'Prophet', hint: 'Predicted a famine and Paul\'s arrest in Jerusalem' },
    // --- Additional Bible People ---
    { word: 'ADAM', category: 'Bible Person', hint: 'The first man God created from the dust' },
    { word: 'NOAH', category: 'Bible Person', hint: 'Built an ark and survived the great flood' },
    { word: 'ISAAC', category: 'Bible Person', hint: 'Son of Abraham, nearly sacrificed on an altar' },
    { word: 'JACOB', category: 'Bible Person', hint: 'Wrestled with God and was renamed Israel' },
    { word: 'DAVID', category: 'Bible Person', hint: 'The shepherd boy who killed Goliath, became king' },
    { word: 'SAUL', category: 'Bible Person', hint: 'Israel\'s first king, anointed by Samuel' },
    { word: 'JONATHAN', category: 'Bible Person', hint: 'David\'s closest friend, son of King Saul' },
    { word: 'STEPHEN', category: 'Bible Person', hint: 'The first Christian martyr, stoned to death' },
    { word: 'PETER', category: 'Bible Person', hint: 'Fisherman, walked on water, denied Jesus three times' },
    { word: 'PAUL', category: 'Bible Person', hint: 'Formerly Saul, met Jesus on the road to Damascus' },
    { word: 'LAZARUS', category: 'Bible Person', hint: 'Jesus raised him from the dead after four days' },
    { word: 'LYDIA', category: 'Bible Person', hint: 'A seller of purple cloth, Paul\'s first European convert' },
    { word: 'TIMOTHY', category: 'Bible Person', hint: 'Paul\'s young protégé, received two letters from him' },
    { word: 'SILAS', category: 'Bible Person', hint: 'Sang hymns with Paul at midnight in a Philippian jail' },
    { word: 'CALEB', category: 'Bible Person', hint: 'One of two spies who gave a good report of Canaan' },
    { word: 'BOAZ', category: 'Bible Person', hint: 'A kinsman-redeemer who married Ruth' },
    { word: 'ELI', category: 'Bible Person', hint: 'The high priest who raised young Samuel in the temple' },
    { word: 'ELIEZER', category: 'Bible Person', hint: 'Abraham\'s servant sent to find a wife for Isaac' },
    { word: 'MATTHEW', category: 'Bible Person', hint: 'A tax collector who became one of the twelve apostles' },
    { word: 'THOMAS', category: 'Bible Person', hint: 'Doubted the resurrection until he saw Jesus\'s wounds' },
    { word: 'ANDREW', category: 'Bible Person', hint: 'Peter\'s brother, first disciple called by Jesus' },
    { word: 'PHILLIP', category: 'Bible Person', hint: 'The apostle who said "show us the Father"' },
    { word: 'PRISCILLA', category: 'Bible Person', hint: 'Taught Apollos the way of God more accurately' },
    { word: 'AQUILA', category: 'Bible Person', hint: 'Tentmaker and husband of Priscilla, co-worker of Paul' },
    { word: 'ABSALOM', category: 'Bible Person', hint: 'David\'s rebellious son, known for his long hair' },
    { word: 'REBEKAH', category: 'Bible Person', hint: 'Drew water for Abraham\'s servant, became Isaac\'s wife' },
    // --- Additional Bible Places ---
    { word: 'EDEN', category: 'Bible Place', hint: 'The garden where Adam and Eve lived before the fall' },
    { word: 'HEBRON', category: 'Bible Place', hint: 'Where Abraham lived and David was first made king' },
    { word: 'JORDAN', category: 'Bible Place', hint: 'The river where Jesus was baptised by John' },
    { word: 'CORINTH', category: 'Bible Place', hint: 'Paul wrote two letters to the church in this Greek city' },
    { word: 'EPHESUS', category: 'Bible Place', hint: 'City of Diana, Paul spent two years here' },
    { word: 'BABYLON', category: 'Bible Place', hint: 'The great empire that took Israel into captivity' },
    { word: 'NINEVEH', category: 'Bible Place', hint: 'The great city Jonah was sent to preach repentance' },
    { word: 'DAMASCUS', category: 'Bible Place', hint: 'Paul was blinded by a light on the road to this city' },
    { word: 'EGYPT', category: 'Bible Place', hint: 'Israel was enslaved here for 400 years' },
    { word: 'CANAAN', category: 'Bible Place', hint: 'The promised land God gave to Abraham\'s descendants' },
    { word: 'PATMOS', category: 'Bible Place', hint: 'The island where John received the book of Revelation' },
    { word: 'PHILIPPI', category: 'Bible Place', hint: 'Paul and Silas were jailed here; Paul wrote a letter here' },
    { word: 'CAESAREA', category: 'Bible Place', hint: 'Paul was imprisoned here before sailing to Rome' },
    { word: 'BETHEL', category: 'Bible Place', hint: 'Jacob saw a ladder to heaven here, meaning House of God' },
    { word: 'CARMEL', category: 'Bible Place', hint: 'Mountain where Elijah defeated the prophets of Baal' },
    // --- Additional Bible Concepts ---
    { word: 'FORGIVENESS', category: 'Bible Concept', hint: 'Releasing someone from the debt of their wrongdoing' },
    { word: 'REPENTANCE', category: 'Bible Concept', hint: 'Turning away from sin and returning to God' },
    { word: 'GRACE', category: 'Bible Concept', hint: 'God\'s unmerited favour toward sinners' },
    { word: 'MERCY', category: 'Bible Concept', hint: 'Compassion shown instead of giving the punishment deserved' },
    { word: 'HOLINESS', category: 'Bible Concept', hint: 'The state of being set apart and pure before God' },
    { word: 'RIGHTEOUSNESS', category: 'Bible Concept', hint: 'Being in right standing with God\'s moral standard' },
    { word: 'RECONCILIATION', category: 'Bible Concept', hint: 'Restoring a broken relationship between God and man' },
    { word: 'GLORIFICATION', category: 'Bible Concept', hint: 'The final stage of salvation — the believer\'s perfect state' },
    { word: 'STEWARDSHIP', category: 'Bible Concept', hint: 'Faithfully managing what God has entrusted to you' },
    { word: 'DISCIPLESHIP', category: 'Bible Concept', hint: 'Following and learning from Jesus as His student' },
    { word: 'FELLOWSHIP', category: 'Bible Concept', hint: 'Deep sharing of life and faith among believers' },
    { word: 'TEMPTATION', category: 'Bible Concept', hint: 'Being lured to disobey God; Jesus faced it 40 days in the wilderness' },
    { word: 'TRIBULATION', category: 'Bible Concept', hint: 'A period of great suffering foretold in scripture' },
    { word: 'OMNISCIENCE', category: 'Bible Concept', hint: 'God\'s attribute of knowing all things' },
    { word: 'OMNIPOTENCE', category: 'Bible Concept', hint: 'God\'s attribute of having all power' },
    // --- Additional Bible Events ---
    { word: 'CREATION', category: 'Bible Event', hint: 'God made the heavens, earth and all living things in six days' },
    { word: 'FLOOD', category: 'Bible Event', hint: 'God covered the earth with water, only Noah\'s ark survived' },
    { word: 'PASSOVER', category: 'Bible Event', hint: 'God spared Israel\'s firstborn when He struck Egypt' },
    { word: 'CAPTIVITY', category: 'Bible Event', hint: 'Israel was taken to Babylon for 70 years' },
    { word: 'INCARNATION', category: 'Bible Event', hint: 'God becoming flesh in the person of Jesus Christ' },
    { word: 'BETRAYAL', category: 'Bible Event', hint: 'Judas handed Jesus over for thirty pieces of silver' },
    { word: 'RESTORATION', category: 'Bible Event', hint: 'Israel\'s return from Babylon to rebuild Jerusalem' },
    { word: 'WILDERNESS', category: 'Bible Event', hint: 'Israel wandered here for 40 years after leaving Egypt' },
    // K starters (needed for Word Chain dead-end coverage)
    { word: 'KORAH', category: 'Bible Person', hint: 'Led a rebellion against Moses in the wilderness' },
    { word: 'KETURAH', category: 'Bible Person', hint: 'Abraham\'s wife after Sarah\'s death' },
    // Y starters
    { word: 'YAHWEH', category: 'Bible Concept', hint: 'The personal name of God revealed to Moses at the burning bush' },
    // W starters (extra coverage)
    { word: 'WISDOM', category: 'Bible Concept', hint: 'Solomon asked God for this gift above all others' },
    // ── Extended Bible vocabulary for Word Chain coverage ────────────────────
    // Core Gospel & Theology
    { word: 'JESUS', category: 'Bible Person', hint: 'The Son of God, Saviour of the world' },
    { word: 'CHRIST', category: 'Bible Concept', hint: 'The Anointed One — the title given to Jesus' },
    { word: 'FAITH', category: 'Bible Concept', hint: 'Trust and belief in God' },
    { word: 'HOLY', category: 'Bible Concept', hint: 'Set apart and pure before God' },
    { word: 'GLORY', category: 'Bible Concept', hint: 'The majesty and honour of God' },
    { word: 'GOSPEL', category: 'Bible Concept', hint: 'The good news of Jesus Christ\'s salvation' },
    { word: 'GRACE', category: 'Bible Concept', hint: 'God\'s undeserved favour toward sinners' },
    { word: 'ANGEL', category: 'Bible Concept', hint: 'A heavenly messenger sent by God' },
    { word: 'SPIRIT', category: 'Bible Concept', hint: 'The Holy Spirit — the third person of the Trinity' },
    { word: 'MESSIAH', category: 'Bible Concept', hint: 'The promised deliverer, the Anointed One' },
    { word: 'SAVIOUR', category: 'Bible Concept', hint: 'Jesus — the one who saves us from sin' },
    { word: 'TRINITY', category: 'Bible Concept', hint: 'Father, Son, and Holy Spirit — one God in three persons' },
    { word: 'ETERNAL', category: 'Bible Concept', hint: 'Without beginning or end — God is eternal' },
    { word: 'DIVINE', category: 'Bible Concept', hint: 'Of or relating to God; Jesus is fully divine' },
    // Prayer & Worship
    { word: 'PRAYER', category: 'Bible Concept', hint: 'Communicating with God' },
    { word: 'WORSHIP', category: 'Bible Concept', hint: 'Honouring and revering God' },
    { word: 'PRAISE', category: 'Bible Concept', hint: 'Expressing thankfulness and honour to God' },
    { word: 'FASTING', category: 'Bible Concept', hint: 'Abstaining from food to seek God' },
    { word: 'AMEN', category: 'Bible Concept', hint: 'So be it — affirming a prayer or statement' },
    { word: 'HALLELUJAH', category: 'Bible Concept', hint: 'Praise the Lord — a Hebrew exclamation of joy' },
    { word: 'HOSANNA', category: 'Bible Concept', hint: 'Cried out by the crowd as Jesus entered Jerusalem' },
    // Kingdom & Places
    { word: 'HEAVEN', category: 'Bible Place', hint: 'The dwelling place of God and eternal home of believers' },
    { word: 'KINGDOM', category: 'Bible Concept', hint: 'The Kingdom of God — His rule and reign' },
    { word: 'ISRAEL', category: 'Bible Place', hint: 'God\'s covenant nation; also the name given to Jacob' },
    { word: 'JUDEA', category: 'Bible Place', hint: 'The southern region of Israel where Jerusalem is' },
    { word: 'ZION', category: 'Bible Place', hint: 'Another name for Jerusalem, the city of God' },
    { word: 'TEMPLE', category: 'Bible Place', hint: 'The house of God built first by Solomon' },
    { word: 'OLIVE', category: 'Bible Place', hint: 'The Mount of Olives — where Jesus prayed before His arrest' },
    { word: 'NAZARENE', category: 'Bible Concept', hint: 'A person from Nazareth — Jesus was called the Nazarene' },
    // Symbols & Objects
    { word: 'LAMB', category: 'Bible Concept', hint: 'Symbol of Jesus — the Lamb of God who takes away sin' },
    { word: 'CROSS', category: 'Bible Event', hint: 'Where Jesus was crucified for our sins' },
    { word: 'CROWN', category: 'Bible Concept', hint: 'Symbol of royalty; believers receive a crown of life' },
    { word: 'BLOOD', category: 'Bible Concept', hint: 'Jesus shed His blood for the forgiveness of sins' },
    { word: 'BREAD', category: 'Bible Concept', hint: 'Jesus called Himself the bread of life' },
    { word: 'WINE', category: 'Bible Concept', hint: 'Part of the Last Supper; Jesus turned water into wine' },
    { word: 'FIRE', category: 'Bible Concept', hint: 'God led Israel as a pillar of fire; the Spirit came as tongues of fire' },
    { word: 'LIGHT', category: 'Bible Concept', hint: 'God is light; Jesus is the light of the world' },
    { word: 'TRUTH', category: 'Bible Concept', hint: '"I am the way the truth and the life" — Jesus' },
    { word: 'ARK', category: 'Bible Concept', hint: 'Noah\'s ark; also the Ark of the Covenant' },
    { word: 'MANNA', category: 'Bible Event', hint: 'Bread from heaven that fed Israel in the wilderness' },
    { word: 'THRONE', category: 'Bible Concept', hint: 'God sits on His throne in heaven' },
    { word: 'ALTAR', category: 'Bible Place', hint: 'A raised structure where offerings and sacrifices were made' },
    { word: 'MANGER', category: 'Bible Event', hint: 'The feeding trough where baby Jesus was laid at His birth' },
    { word: 'VINEYARD', category: 'Bible Place', hint: 'Jesus used the vineyard as a symbol in many parables' },
    // Virtues & Concepts
    { word: 'HOPE', category: 'Bible Concept', hint: 'Confident expectation in God\'s promises' },
    { word: 'LOVE', category: 'Bible Concept', hint: 'God is love; the greatest commandment' },
    { word: 'JOY', category: 'Bible Concept', hint: 'A fruit of the Spirit; the joy of the Lord is your strength' },
    { word: 'PEACE', category: 'Bible Concept', hint: 'A fruit of the Spirit; Jesus is the Prince of Peace' },
    { word: 'BLESSING', category: 'Bible Concept', hint: 'God\'s favour and goodness poured out on His people' },
    { word: 'VISION', category: 'Bible Concept', hint: 'A divine revelation — Daniel and Ezekiel had many visions' },
    { word: 'CHOSEN', category: 'Bible Concept', hint: 'Believers are a chosen generation, a royal priesthood' },
    { word: 'RIGHTEOUS', category: 'Bible Concept', hint: 'In right standing with God; the righteous live by faith' },
    { word: 'OFFERING', category: 'Bible Concept', hint: 'A gift or sacrifice presented to God' },
    { word: 'ANOINTING', category: 'Bible Concept', hint: 'Being set apart and empowered by God\'s Spirit' },
    { word: 'SCRIPTURE', category: 'Bible Concept', hint: 'The written Word of God — the Bible' },
    { word: 'MYSTERY', category: 'Bible Concept', hint: 'Paul speaks of the mystery of the gospel — Christ in you' },
    { word: 'SERVANT', category: 'Bible Concept', hint: 'Jesus came as a servant; Isaiah prophesied the suffering servant' },
    { word: 'APOSTLE', category: 'Bible Concept', hint: 'One sent out — the twelve chosen by Jesus' },
    { word: 'DISCIPLE', category: 'Bible Concept', hint: 'A follower and student of Jesus' },
    // People not yet in bank
    { word: 'HEROD', category: 'Bible Person', hint: 'The king who tried to kill baby Jesus' },
    { word: 'PILATE', category: 'Bible Person', hint: 'The Roman governor who sentenced Jesus to crucifixion' },
    { word: 'MARK', category: 'Bible Person', hint: 'Wrote the second Gospel; companion of Paul and Barnabas' },
    { word: 'LUKE', category: 'Bible Person', hint: 'A physician who wrote the third Gospel and Acts' },
    { word: 'NAOMI', category: 'Bible Person', hint: 'Ruth\'s mother-in-law who returned to Bethlehem' },
    { word: 'RAHAB', category: 'Bible Person', hint: 'Hid the Israelite spies in Jericho and was spared' },
    { word: 'URIAH', category: 'Bible Person', hint: 'The Hittite soldier whose wife Bathsheba was taken by David' },
    { word: 'UZZIAH', category: 'Bible Person', hint: 'King of Judah; Isaiah saw God\'s vision in the year Uzziah died' },
    { word: 'ISHMAEL', category: 'Bible Person', hint: 'Abraham\'s son by Hagar, ancestor of the Arab nations' },
    { word: 'BALAAM', category: 'Bible Person', hint: 'A prophet whose donkey spoke to him by God\'s command' },
    { word: 'JEZEBEL', category: 'Bible Person', hint: 'The wicked queen who persecuted Elijah and promoted Baal worship' },
    { word: 'MANASSEH', category: 'Bible Person', hint: 'One of Joseph\'s two sons; also a wicked king who later repented' },
    { word: 'NEHEMIAH', category: 'Bible Person', hint: 'Cupbearer to the king; rebuilt the walls of Jerusalem' },
    // Letter coverage gaps
    { word: 'QUEEN', category: 'Bible Person', hint: 'Esther and the Queen of Sheba — notable queens of the Bible' },
    { word: 'UNCLEAN', category: 'Bible Concept', hint: 'Ceremonially impure — Jesus declared all foods clean' },
    { word: 'VESTURE', category: 'Bible Concept', hint: 'A garment — soldiers cast lots for Jesus\' vesture at the cross' },
    { word: 'XERXES', category: 'Bible Person', hint: 'The Persian king also known as Ahasuerus who made Esther his queen' },
];
exports.WORD_BANK = WORD_BANK;
// Short, familiar words used when a session runs in test mode
exports.TEST_WORD_BANK_WORDS = [
    'ADAM', 'BOAZ', 'DAVID', 'EDEN', 'FLOOD',
    'GRACE', 'HOSEA', 'ISAAC', 'JOEL', 'RUTH',
];
function pickRandomWord(usedWords = []) {
    const available = WORD_BANK.filter(w => !usedWords.includes(w.word));
    const pool = available.length > 0 ? available : WORD_BANK;
    return pool[Math.floor(Math.random() * pool.length)];
}
function maskWord(word) {
    return word.split('').map(() => '_').join(' ');
}
function revealLetters(word, guessedLetters) {
    return word
        .split('')
        .map(ch => (guessedLetters.includes(ch) ? ch : '_'))
        .join(' ');
}
function checkLetter(state, letter) {
    const upper = letter.toUpperCase();
    const positions = [];
    state.word.split('').forEach((ch, i) => {
        if (ch === upper)
            positions.push(i);
    });
    const correct = positions.length > 0;
    const newGuessed = [...state.guessedLetters, upper];
    const newMasked = revealLetters(state.word, newGuessed);
    const pointsDelta = correct ? positions.length : -1; // +1 per letter revealed, -1 for wrong
    return { correct, newMasked, pointsDelta, positions };
}
function isWordSolved(maskedWord) {
    return !maskedWord.includes('_');
}
function initHangmanState(entry, round, total) {
    return {
        word: entry.word,
        maskedWord: maskWord(entry.word),
        category: entry.category,
        hint: entry.hint,
        guessedLetters: [],
        wrongLetters: [],
        wrongCount: 0,
        maxWrong: 6,
        wordSolved: false,
        roundNumber: round,
        totalRounds: total,
    };
}
function toClientState(state) {
    // Strip the actual word — clients never see it
    const { word: _word, ...rest } = state;
    void _word;
    return rest;
}
