import { HangmanState, HangmanClientState } from '../types';

export interface WordEntry {
  word: string;
  category: string;
  hint: string;
}

const WORD_BANK: WordEntry[] = [
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
];

export { WORD_BANK };

export function pickRandomWord(usedWords: string[] = []): WordEntry {
  const available = WORD_BANK.filter(w => !usedWords.includes(w.word));
  const pool = available.length > 0 ? available : WORD_BANK;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function maskWord(word: string): string {
  return word.split('').map(() => '_').join(' ');
}

export function revealLetters(word: string, guessedLetters: string[]): string {
  return word
    .split('')
    .map(ch => (guessedLetters.includes(ch) ? ch : '_'))
    .join(' ');
}

export function checkLetter(
  state: HangmanState,
  letter: string
): { correct: boolean; newMasked: string; pointsDelta: number; positions: number[] } {
  const upper = letter.toUpperCase();
  const positions: number[] = [];

  state.word.split('').forEach((ch, i) => {
    if (ch === upper) positions.push(i);
  });

  const correct = positions.length > 0;
  const newGuessed = [...state.guessedLetters, upper];
  const newMasked = revealLetters(state.word, newGuessed);
  const pointsDelta = correct ? positions.length : -1; // +1 per letter revealed, -1 for wrong

  return { correct, newMasked, pointsDelta, positions };
}

export function isWordSolved(maskedWord: string): boolean {
  return !maskedWord.includes('_');
}

export function initHangmanState(entry: WordEntry, round: number, total: number): HangmanState {
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

export function toClientState(state: HangmanState): HangmanClientState {
  // Strip the actual word — clients never see it
  const { word: _word, ...rest } = state;
  void _word;
  return rest;
}
