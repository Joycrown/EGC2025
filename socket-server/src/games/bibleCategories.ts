export interface CategoryAnswer {
  text: string;       // canonical display text (shown on board when found)
  aliases: string[];  // accepted input variations (all normalize to one token)
  points: number;
}

export interface BibleCategory {
  id: string;
  title: string;
  subtitle: string;
  answers: CategoryAnswer[];
}

// ── Question bank ─────────────────────────────────────────────────

export const BIBLE_CATEGORIES: BibleCategory[] = [
  {
    id: 'fruits-of-spirit',
    title: 'Name a Fruit of the Spirit',
    subtitle: 'Galatians 5:22-23 — 9 on the board',
    answers: [
      { text: 'Love',         aliases: ['love', 'agape'],                           points: 1 },
      { text: 'Joy',          aliases: ['joy'],                                      points: 1 },
      { text: 'Peace',        aliases: ['peace'],                                    points: 1 },
      { text: 'Patience',     aliases: ['patience', 'longsuffering', 'forbearance'], points: 2 },
      { text: 'Kindness',     aliases: ['kindness', 'benignity'],                    points: 2 },
      { text: 'Goodness',     aliases: ['goodness'],                                 points: 2 },
      { text: 'Faithfulness', aliases: ['faithfulness', 'fidelity'],                 points: 2 },
      { text: 'Gentleness',   aliases: ['gentleness', 'meekness'],                   points: 2 },
      { text: 'Temperance',   aliases: ['temperance', 'selfcontrol', 'self-control'], points: 3 },
    ],
  },
  {
    id: 'twelve-disciples',
    title: 'Name one of the 12 Disciples of Jesus',
    subtitle: 'Matthew 10:2-4 — 12 on the board',
    answers: [
      { text: 'Peter',       aliases: ['peter', 'simon', 'cephas'],                 points: 1 },
      { text: 'Andrew',      aliases: ['andrew'],                                    points: 1 },
      { text: 'James',       aliases: ['james'],                                     points: 1 },
      { text: 'John',        aliases: ['john'],                                      points: 1 },
      { text: 'Philip',      aliases: ['philip'],                                    points: 2 },
      { text: 'Bartholomew', aliases: ['bartholomew', 'nathanael', 'nathaniel'],     points: 2 },
      { text: 'Matthew',     aliases: ['matthew', 'levi'],                           points: 2 },
      { text: 'Thomas',      aliases: ['thomas', 'didymus'],                         points: 2 },
      { text: 'Thaddaeus',   aliases: ['thaddaeus', 'lebbaeus', 'judas'],            points: 3 },
      { text: 'Simon',       aliases: ['simon', 'zealot', 'simonthezealot'],         points: 3 },
      { text: 'Judas',       aliases: ['judas', 'iscariot', 'judasicariot'],         points: 2 },
      { text: 'James',       aliases: ['jamesalphaeus', 'alphaeus'],                 points: 3 },
    ],
  },
  {
    id: 'sons-of-jacob',
    title: 'Name a Son of Jacob',
    subtitle: 'Genesis — The 12 Tribes — 12 on the board',
    answers: [
      { text: 'Reuben',   aliases: ['reuben'],               points: 1 },
      { text: 'Simeon',   aliases: ['simeon'],               points: 2 },
      { text: 'Levi',     aliases: ['levi'],                 points: 2 },
      { text: 'Judah',    aliases: ['judah'],                points: 1 },
      { text: 'Dan',      aliases: ['dan'],                  points: 2 },
      { text: 'Naphtali', aliases: ['naphtali'],             points: 3 },
      { text: 'Gad',      aliases: ['gad'],                  points: 2 },
      { text: 'Asher',    aliases: ['asher'],                points: 2 },
      { text: 'Issachar', aliases: ['issachar'],             points: 3 },
      { text: 'Zebulun',  aliases: ['zebulun', 'zabulon'],   points: 3 },
      { text: 'Joseph',   aliases: ['joseph'],               points: 1 },
      { text: 'Benjamin', aliases: ['benjamin'],             points: 1 },
    ],
  },
  {
    id: 'plagues-of-egypt',
    title: 'Name a Plague of Egypt',
    subtitle: 'Exodus 7-12 — 10 on the board',
    answers: [
      { text: 'Blood',     aliases: ['blood'],               points: 1 },
      { text: 'Frogs',     aliases: ['frogs', 'frog'],       points: 1 },
      { text: 'Lice',      aliases: ['lice', 'gnats'],       points: 2 },
      { text: 'Flies',     aliases: ['flies', 'fly'],        points: 2 },
      { text: 'Livestock', aliases: ['livestock', 'cattle', 'murrain'], points: 2 },
      { text: 'Boils',     aliases: ['boils', 'sores'],      points: 2 },
      { text: 'Hail',      aliases: ['hail'],                points: 2 },
      { text: 'Locusts',   aliases: ['locusts', 'locust'],   points: 2 },
      { text: 'Darkness',  aliases: ['darkness', 'dark'],    points: 2 },
      { text: 'Firstborn', aliases: ['firstborn', 'death'],  points: 3 },
    ],
  },
  {
    id: 'books-of-paul',
    title: 'Name a Book Written by Paul',
    subtitle: 'New Testament Epistles — 13 on the board',
    answers: [
      { text: 'Romans',         aliases: ['romans'],                                    points: 1 },
      { text: '1 Corinthians',  aliases: ['1corinthians', 'firstcorinthians', 'corinthians'], points: 1 },
      { text: '2 Corinthians',  aliases: ['2corinthians', 'secondcorinthians'],         points: 2 },
      { text: 'Galatians',      aliases: ['galatians'],                                 points: 2 },
      { text: 'Ephesians',      aliases: ['ephesians'],                                 points: 2 },
      { text: 'Philippians',    aliases: ['philippians'],                               points: 2 },
      { text: 'Colossians',     aliases: ['colossians'],                                points: 2 },
      { text: '1 Thessalonians',aliases: ['1thessalonians', 'thessalonians', 'firstthessalonians'], points: 2 },
      { text: '2 Thessalonians',aliases: ['2thessalonians', 'secondthessalonians'],     points: 3 },
      { text: '1 Timothy',      aliases: ['1timothy', 'timothy', 'firsttimothy'],       points: 2 },
      { text: '2 Timothy',      aliases: ['2timothy', 'secondtimothy'],                 points: 3 },
      { text: 'Titus',          aliases: ['titus'],                                     points: 3 },
      { text: 'Philemon',       aliases: ['philemon'],                                  points: 3 },
    ],
  },
  {
    id: 'women-of-faith',
    title: 'Name a Woman of Faith in the Bible',
    subtitle: 'Old & New Testament — 10 on the board',
    answers: [
      { text: 'Ruth',          aliases: ['ruth'],                           points: 1 },
      { text: 'Esther',        aliases: ['esther'],                         points: 1 },
      { text: 'Mary',          aliases: ['mary'],                           points: 1 },
      { text: 'Deborah',       aliases: ['deborah'],                        points: 2 },
      { text: 'Hannah',        aliases: ['hannah'],                         points: 2 },
      { text: 'Rahab',         aliases: ['rahab'],                          points: 2 },
      { text: 'Sarah',         aliases: ['sarah', 'sarai'],                 points: 2 },
      { text: 'Priscilla',     aliases: ['priscilla'],                      points: 3 },
      { text: 'Lydia',         aliases: ['lydia'],                          points: 3 },
      { text: 'Magdalene',     aliases: ['magdalene', 'marymagdalene'],     points: 2 },
    ],
  },
  {
    id: 'gifts-of-spirit',
    title: 'Name a Gift of the Holy Spirit',
    subtitle: '1 Corinthians 12 & Romans 12 — 12 on the board',
    answers: [
      { text: 'Wisdom',         aliases: ['wisdom'],          points: 1 },
      { text: 'Knowledge',      aliases: ['knowledge'],       points: 1 },
      { text: 'Faith',          aliases: ['faith'],           points: 1 },
      { text: 'Healing',        aliases: ['healing'],         points: 1 },
      { text: 'Miracles',       aliases: ['miracles'],        points: 2 },
      { text: 'Prophecy',       aliases: ['prophecy', 'prophesying'], points: 2 },
      { text: 'Discernment',    aliases: ['discernment'],     points: 2 },
      { text: 'Tongues',        aliases: ['tongues'],         points: 2 },
      { text: 'Interpretation', aliases: ['interpretation'],  points: 3 },
      { text: 'Teaching',       aliases: ['teaching'],        points: 2 },
      { text: 'Giving',         aliases: ['giving', 'generosity'], points: 2 },
      { text: 'Leadership',     aliases: ['leadership', 'administration'], points: 2 },
    ],
  },
  {
    id: 'judges-of-israel',
    title: 'Name a Judge of Israel',
    subtitle: 'Book of Judges — 10 on the board',
    answers: [
      { text: 'Gideon',   aliases: ['gideon', 'jerubbaal'],               points: 1 },
      { text: 'Samson',   aliases: ['samson'],                             points: 1 },
      { text: 'Deborah',  aliases: ['deborah'],                            points: 1 },
      { text: 'Barak',    aliases: ['barak'],                              points: 2 },
      { text: 'Jephthah', aliases: ['jephthah'],                          points: 2 },
      { text: 'Ehud',     aliases: ['ehud'],                               points: 2 },
      { text: 'Othniel',  aliases: ['othniel'],                            points: 3 },
      { text: 'Shamgar',  aliases: ['shamgar'],                            points: 3 },
      { text: 'Tola',     aliases: ['tola'],                               points: 3 },
      { text: 'Samuel',   aliases: ['samuel'],                             points: 1 },
    ],
  },
  {
    id: 'mountains-of-bible',
    title: 'Name a Mountain Mentioned in the Bible',
    subtitle: 'Old & New Testament — 9 on the board',
    answers: [
      { text: 'Sinai',  aliases: ['sinai', 'horeb'],   points: 1 },
      { text: 'Zion',   aliases: ['zion'],              points: 1 },
      { text: 'Olivet', aliases: ['olivet', 'olives'],  points: 1 },
      { text: 'Carmel', aliases: ['carmel'],             points: 2 },
      { text: 'Hermon', aliases: ['hermon'],             points: 2 },
      { text: 'Ararat', aliases: ['ararat'],             points: 2 },
      { text: 'Tabor',  aliases: ['tabor'],              points: 3 },
      { text: 'Moriah', aliases: ['moriah'],             points: 2 },
      { text: 'Nebo',   aliases: ['nebo'],               points: 3 },
    ],
  },
  {
    id: 'books-of-moses',
    title: 'Name a Book Written by Moses (Pentateuch)',
    subtitle: 'The First Five Books — 5 on the board',
    answers: [
      { text: 'Genesis',     aliases: ['genesis', 'gen'],       points: 1 },
      { text: 'Exodus',      aliases: ['exodus', 'exo'],        points: 1 },
      { text: 'Leviticus',   aliases: ['leviticus', 'lev'],     points: 2 },
      { text: 'Numbers',     aliases: ['numbers', 'num'],       points: 2 },
      { text: 'Deuteronomy', aliases: ['deuteronomy', 'deut'],  points: 3 },
    ],
  },
  {
    id: 'kings-of-israel',
    title: 'Name a King of Israel or Judah',
    subtitle: 'Old Testament Kings — 10 on the board',
    answers: [
      { text: 'Saul',            aliases: ['saul'],                                   points: 1 },
      { text: 'David',           aliases: ['david'],                                  points: 1 },
      { text: 'Solomon',         aliases: ['solomon'],                                points: 1 },
      { text: 'Rehoboam',        aliases: ['rehoboam'],                               points: 2 },
      { text: 'Jeroboam',        aliases: ['jeroboam'],                               points: 2 },
      { text: 'Ahab',            aliases: ['ahab'],                                   points: 2 },
      { text: 'Hezekiah',        aliases: ['hezekiah'],                               points: 2 },
      { text: 'Josiah',          aliases: ['josiah'],                                 points: 2 },
      { text: 'Jehoshaphat',     aliases: ['jehoshaphat'],                            points: 3 },
      { text: 'Nebuchadnezzar',  aliases: ['nebuchadnezzar', 'nebuchadnezar'],        points: 2 },
    ],
  },
  {
    id: 'rivers-in-bible',
    title: 'Name a River Mentioned in the Bible',
    subtitle: 'Geography of the Bible — 8 on the board',
    answers: [
      { text: 'Jordan',    aliases: ['jordan'],              points: 1 },
      { text: 'Nile',      aliases: ['nile'],                points: 1 },
      { text: 'Euphrates', aliases: ['euphrates'],           points: 2 },
      { text: 'Tigris',    aliases: ['tigris', 'hiddekel'],  points: 2 },
      { text: 'Gihon',     aliases: ['gihon'],               points: 3 },
      { text: 'Pishon',    aliases: ['pishon'],              points: 3 },
      { text: 'Abana',     aliases: ['abana'],               points: 3 },
      { text: 'Pharpar',   aliases: ['pharpar'],             points: 3 },
    ],
  },
  {
    id: 'animals-of-bible',
    title: 'Name an Animal Mentioned in the Bible',
    subtitle: 'Old & New Testament — 15 on the board',
    answers: [
      { text: 'Lion',      aliases: ['lion', 'lions'],                    points: 1 },
      { text: 'Lamb',      aliases: ['lamb', 'sheep'],                    points: 1 },
      { text: 'Dove',      aliases: ['dove', 'pigeon'],                   points: 1 },
      { text: 'Serpent',   aliases: ['serpent', 'snake', 'viper'],        points: 1 },
      { text: 'Donkey',    aliases: ['donkey', 'ass', 'mule'],            points: 2 },
      { text: 'Camel',     aliases: ['camel'],                            points: 2 },
      { text: 'Eagle',     aliases: ['eagle'],                            points: 2 },
      { text: 'Raven',     aliases: ['raven', 'crow'],                    points: 2 },
      { text: 'Fish',      aliases: ['fish', 'whale'],                    points: 2 },
      { text: 'Bear',      aliases: ['bear'],                             points: 2 },
      { text: 'Ox',        aliases: ['ox', 'oxen', 'bull'],               points: 2 },
      { text: 'Locust',    aliases: ['locust', 'locusts'],                points: 2 },
      { text: 'Sparrow',   aliases: ['sparrow'],                          points: 3 },
      { text: 'Behemoth',  aliases: ['behemoth'],                         points: 3 },
      { text: 'Leviathan', aliases: ['leviathan'],                        points: 3 },
    ],
  },
  {
    id: 'cities-of-bible',
    title: 'Name a Famous City in the Bible',
    subtitle: 'Old & New Testament — 20 on the board',
    answers: [
      { text: 'Jerusalem', aliases: ['jerusalem'],              points: 1 },
      { text: 'Bethlehem', aliases: ['bethlehem'],              points: 1 },
      { text: 'Nazareth',  aliases: ['nazareth'],               points: 1 },
      { text: 'Jericho',   aliases: ['jericho'],                points: 1 },
      { text: 'Babylon',   aliases: ['babylon', 'babel'],       points: 2 },
      { text: 'Nineveh',   aliases: ['nineveh', 'ninevah'],     points: 2 },
      { text: 'Samaria',   aliases: ['samaria'],                points: 2 },
      { text: 'Damascus',  aliases: ['damascus'],               points: 2 },
      { text: 'Capernaum', aliases: ['capernaum'],              points: 2 },
      { text: 'Antioch',   aliases: ['antioch'],                points: 2 },
      { text: 'Corinth',   aliases: ['corinth'],                points: 2 },
      { text: 'Ephesus',   aliases: ['ephesus'],                points: 2 },
      { text: 'Rome',      aliases: ['rome'],                   points: 2 },
      { text: 'Bethany',   aliases: ['bethany'],                points: 2 },
      { text: 'Sodom',     aliases: ['sodom'],                  points: 2 },
      { text: 'Hebron',    aliases: ['hebron'],                 points: 3 },
      { text: 'Philippi',  aliases: ['philippi'],               points: 3 },
      { text: 'Athens',    aliases: ['athens'],                 points: 3 },
      { text: 'Tarsus',    aliases: ['tarsus'],                 points: 3 },
      { text: 'Beersheba', aliases: ['beersheba', 'beersheba'], points: 3 },
    ],
  },
  {
    id: 'names-of-god',
    title: 'Name a Name or Title of God',
    subtitle: 'Old & New Testament — 10 on the board',
    answers: [
      { text: 'Jehovah',   aliases: ['jehovah', 'yahweh', 'yhwh'],        points: 2 },
      { text: 'Elohim',    aliases: ['elohim'],                            points: 2 },
      { text: 'Adonai',    aliases: ['adonai', 'lord'],                    points: 2 },
      { text: 'Shaddai',   aliases: ['shaddai', 'elshaddai', 'almighty'], points: 2 },
      { text: 'Emmanuel',  aliases: ['emmanuel', 'immanuel'],              points: 2 },
      { text: 'Jireh',     aliases: ['jireh', 'jehovahjireh', 'provider'], points: 2 },
      { text: 'Rapha',     aliases: ['rapha', 'jehovahrapha', 'healer'],   points: 2 },
      { text: 'Shalom',    aliases: ['shalom', 'jehovahshalom'],           points: 3 },
      { text: 'Nissi',     aliases: ['nissi', 'jehovahnissi', 'banner'],   points: 3 },
      { text: 'Sabaoth',   aliases: ['sabaoth', 'lordsabaoth'],            points: 3 },
    ],
  },
  {
    id: 'armour-of-god',
    title: 'Name a Piece of the Armour of God',
    subtitle: 'Ephesians 6:13-17 — 6 on the board',
    answers: [
      { text: 'Belt',        aliases: ['belt', 'truth'],                    points: 1 },
      { text: 'Breastplate', aliases: ['breastplate', 'righteousness'],     points: 2 },
      { text: 'Shoes',       aliases: ['shoes', 'sandals', 'feet', 'peace'], points: 2 },
      { text: 'Shield',      aliases: ['shield', 'faith'],                  points: 2 },
      { text: 'Helmet',      aliases: ['helmet', 'salvation'],              points: 2 },
      { text: 'Sword',       aliases: ['sword', 'spirit', 'word'],          points: 3 },
    ],
  },
  {
    id: 'tabernacle-items',
    title: 'Name an Item Found in the Tabernacle',
    subtitle: 'Exodus 25-40 — 8 on the board',
    answers: [
      { text: 'Ark',       aliases: ['ark', 'covenant'],                   points: 1 },
      { text: 'Menorah',   aliases: ['menorah', 'lampstand', 'candlestick'], points: 2 },
      { text: 'Shewbread', aliases: ['shewbread', 'showbread', 'bread'],   points: 2 },
      { text: 'Incense',   aliases: ['incense', 'altar'],                  points: 2 },
      { text: 'Laver',     aliases: ['laver', 'basin', 'washingbasin'],    points: 3 },
      { text: 'Veil',      aliases: ['veil', 'curtain'],                   points: 2 },
      { text: 'Altar',     aliases: ['altar', 'bronzealtar', 'burntoffering'], points: 2 },
      { text: 'Mercy Seat',aliases: ['mercyseat', 'atonement', 'cover'],   points: 3 },
    ],
  },
  {
    id: 'beatitudes',
    title: 'Complete: "Blessed are the ___"',
    subtitle: 'Matthew 5:3-11 — 8 on the board',
    answers: [
      { text: 'Poor',         aliases: ['poor', 'humble'],                  points: 1 },
      { text: 'Mourners',     aliases: ['mourners', 'mourn'],               points: 1 },
      { text: 'Meek',         aliases: ['meek', 'gentle'],                  points: 1 },
      { text: 'Hungry',       aliases: ['hungry', 'thirsty', 'righteousness'], points: 2 },
      { text: 'Merciful',     aliases: ['merciful', 'mercy'],               points: 2 },
      { text: 'Pure',         aliases: ['pure', 'heart'],                   points: 2 },
      { text: 'Peacemakers',  aliases: ['peacemakers', 'peace'],            points: 2 },
      { text: 'Persecuted',   aliases: ['persecuted', 'persecution'],       points: 3 },
    ],
  },
  {
    id: 'ten-commandments',
    title: 'Name the Key Word of a Commandment',
    subtitle: 'Exodus 20 — 9 on the board',
    answers: [
      { text: 'Idols',    aliases: ['idols', 'idol', 'images', 'graven'],   points: 1 },
      { text: 'Vain',     aliases: ['vain', 'name'],                        points: 2 },
      { text: 'Sabbath',  aliases: ['sabbath', 'rest', 'sunday'],           points: 1 },
      { text: 'Parents',  aliases: ['parents', 'honour', 'honor', 'father', 'mother'], points: 1 },
      { text: 'Murder',   aliases: ['murder', 'kill'],                      points: 1 },
      { text: 'Adultery', aliases: ['adultery'],                             points: 2 },
      { text: 'Steal',    aliases: ['steal', 'stealing', 'theft'],          points: 1 },
      { text: 'Witness',  aliases: ['witness', 'lie', 'lying', 'false'],    points: 2 },
      { text: 'Covet',    aliases: ['covet', 'covetousness'],               points: 2 },
    ],
  },
  {
    id: 'major-prophets',
    title: 'Name a Major Prophet of the Old Testament',
    subtitle: 'The Five Major Prophetic Books — 5 on the board',
    answers: [
      { text: 'Isaiah',       aliases: ['isaiah'],                            points: 1 },
      { text: 'Jeremiah',     aliases: ['jeremiah'],                          points: 1 },
      { text: 'Lamentations', aliases: ['lamentations'],                      points: 3 },
      { text: 'Ezekiel',      aliases: ['ezekiel'],                           points: 1 },
      { text: 'Daniel',       aliases: ['daniel'],                            points: 1 },
    ],
  },
  {
    id: 'parables-of-jesus',
    title: 'Name a Parable of Jesus (one key word)',
    subtitle: 'Gospels — 9 on the board',
    answers: [
      { text: 'Prodigal',   aliases: ['prodigal', 'son'],                    points: 1 },
      { text: 'Samaritan',  aliases: ['samaritan'],                          points: 1 },
      { text: 'Sower',      aliases: ['sower', 'seeds'],                     points: 2 },
      { text: 'Talents',    aliases: ['talents'],                            points: 2 },
      { text: 'Mustard',    aliases: ['mustard', 'mustardseed'],             points: 2 },
      { text: 'Virgins',    aliases: ['virgins', 'lamps', 'bridegroom'],     points: 3 },
      { text: 'Shepherd',   aliases: ['shepherd', 'lostsheep', 'sheep'],     points: 2 },
      { text: 'Coin',       aliases: ['coin', 'lostcoin'],                   points: 2 },
      { text: 'Banquet',    aliases: ['banquet', 'feast', 'wedding'],        points: 3 },
    ],
  },
  {
    id: 'miracles-of-jesus',
    title: 'Name a Miracle of Jesus (one key word)',
    subtitle: 'Gospels — 9 on the board',
    answers: [
      { text: 'Wine',      aliases: ['wine', 'water'],                       points: 1 },
      { text: 'Loaves',    aliases: ['loaves', 'fish', 'feeding', 'multitude'], points: 1 },
      { text: 'Walking',   aliases: ['walking', 'water'],                    points: 1 },
      { text: 'Lazarus',   aliases: ['lazarus'],                             points: 2 },
      { text: 'Blind',     aliases: ['blind', 'sight', 'bartimaeus'],        points: 2 },
      { text: 'Leper',     aliases: ['leper', 'leprosy', 'cleansing'],       points: 2 },
      { text: 'Storm',     aliases: ['storm', 'calm', 'wind'],               points: 2 },
      { text: 'Paralytic', aliases: ['paralytic', 'mat', 'walk'],            points: 2 },
      { text: 'Jairus',    aliases: ['jairus', 'daughter', 'girl'],          points: 3 },
    ],
  },
  {
    id: 'occupations-in-bible',
    title: 'Name an Occupation of a Bible Character',
    subtitle: 'Old & New Testament — 10 on the board',
    answers: [
      { text: 'Fisherman',   aliases: ['fisherman', 'fisher'],               points: 1 },
      { text: 'Shepherd',    aliases: ['shepherd', 'herdsman'],              points: 1 },
      { text: 'Carpenter',   aliases: ['carpenter'],                         points: 1 },
      { text: 'Tax Collector',aliases: ['taxcollector', 'publican', 'tax'], points: 2 },
      { text: 'Tentmaker',   aliases: ['tentmaker', 'tent'],                 points: 2 },
      { text: 'Physician',   aliases: ['physician', 'doctor', 'luke'],       points: 2 },
      { text: 'Farmer',      aliases: ['farmer', 'tiller'],                  points: 2 },
      { text: 'King',        aliases: ['king', 'ruler'],                     points: 1 },
      { text: 'Prophet',     aliases: ['prophet', 'seer'],                   points: 1 },
      { text: 'Priest',      aliases: ['priest', 'levite'],                  points: 1 },
    ],
  },
];

// ── Test-only categories ─────────────────────────────────────────
// These IDs are NOT in CATEGORY_IDS (poolAssignment) so they can
// never be assigned to a real tournament session.

export const TEST_CATEGORIES: BibleCategory[] = [
  {
    id: 'test-creation',
    title: 'Name something God created in Genesis 1',
    subtitle: 'Genesis 1 — 10 on the board',
    answers: [
      { text: 'Light',     aliases: ['light'],               points: 1 },
      { text: 'Sky',       aliases: ['sky', 'firmament', 'heavens'], points: 1 },
      { text: 'Land',      aliases: ['land', 'earth', 'ground'],    points: 1 },
      { text: 'Sea',       aliases: ['sea', 'water', 'ocean'],      points: 1 },
      { text: 'Plants',    aliases: ['plants', 'grass', 'trees', 'vegetation'], points: 1 },
      { text: 'Sun',       aliases: ['sun'],                  points: 1 },
      { text: 'Moon',      aliases: ['moon'],                 points: 1 },
      { text: 'Stars',     aliases: ['stars', 'star'],        points: 1 },
      { text: 'Animals',   aliases: ['animals', 'creatures', 'beasts'], points: 1 },
      { text: 'Man',       aliases: ['man', 'human', 'adam', 'mankind', 'people'], points: 1 },
    ],
  },
  {
    id: 'test-salvation',
    title: 'Name a word associated with Salvation',
    subtitle: 'Core Gospel — 9 on the board',
    answers: [
      { text: 'Grace',      aliases: ['grace'],               points: 1 },
      { text: 'Faith',      aliases: ['faith', 'belief'],     points: 1 },
      { text: 'Mercy',      aliases: ['mercy'],               points: 1 },
      { text: 'Forgiveness',aliases: ['forgiveness', 'forgive'], points: 1 },
      { text: 'Cross',      aliases: ['cross'],               points: 1 },
      { text: 'Love',       aliases: ['love'],                points: 1 },
      { text: 'Redemption', aliases: ['redemption', 'redeem'], points: 1 },
      { text: 'Repentance', aliases: ['repentance', 'repent'], points: 1 },
      { text: 'Hope',       aliases: ['hope'],                points: 1 },
    ],
  },
];

// Used when testMode: true — these categories are NEVER in the tournament pool
export const TEST_CATEGORY_IDS = ['test-creation', 'test-salvation'];

// Pick N random categories for a game session
export function pickCategories(count: number): BibleCategory[] {
  const shuffled = [...BIBLE_CATEGORIES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Match an answer against the category's answer list.
// Normalizes input: lowercase + strip all non-alphanumeric chars (spaces, hyphens, etc.)
// then does an exact comparison — no substring/containment checks needed because
// all canonical answers are single-concept words.
export function matchAnswer(
  input: string,
  category: BibleCategory,
  alreadyFound: string[]
): CategoryAnswer | null {
  const normalize = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const normalized = normalize(input);
  if (normalized.length < 2) return null;

  for (const answer of category.answers) {
    if (alreadyFound.includes(answer.text)) continue;
    const forms = [answer.text, ...answer.aliases].map(normalize);
    if (forms.includes(normalized)) return answer;
  }
  return null;
}
