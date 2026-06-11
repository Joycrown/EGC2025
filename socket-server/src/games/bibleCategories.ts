export interface CategoryAnswer {
  text: string;       // canonical answer
  aliases: string[];  // accepted variations
  points: number;
}

export interface BibleCategory {
  id: string;
  title: string;        // shown on board: "Name a fruit of the Spirit"
  subtitle: string;     // hint: "Galatians 5:22-23"
  answers: CategoryAnswer[];
}

// ── Question bank ─────────────────────────────────────────────────

export const BIBLE_CATEGORIES: BibleCategory[] = [
  {
    id: 'fruits-of-spirit',
    title: 'Name a Fruit of the Spirit',
    subtitle: 'Galatians 5:22-23',
    answers: [
      { text: 'Love',        aliases: ['love', 'agape'],                     points: 1 },
      { text: 'Joy',         aliases: ['joy', 'joyful'],                     points: 1 },
      { text: 'Peace',       aliases: ['peace'],                              points: 1 },
      { text: 'Patience',    aliases: ['patience', 'longsuffering', 'forbearance'], points: 2 },
      { text: 'Kindness',    aliases: ['kindness', 'benignity'],              points: 2 },
      { text: 'Goodness',    aliases: ['goodness'],                           points: 2 },
      { text: 'Faithfulness',aliases: ['faithfulness', 'faith'],              points: 2 },
      { text: 'Gentleness',  aliases: ['gentleness', 'meekness'],             points: 2 },
      { text: 'Self-control',aliases: ['self-control', 'self control', 'temperance'], points: 3 },
    ],
  },
  {
    id: 'armour-of-god',
    title: 'Name a Piece of the Armour of God',
    subtitle: 'Ephesians 6:13-17',
    answers: [
      { text: 'Belt of Truth',          aliases: ['belt of truth', 'truth', 'belt'],           points: 1 },
      { text: 'Breastplate of Righteousness', aliases: ['breastplate', 'breastplate of righteousness', 'righteousness'], points: 2 },
      { text: 'Shoes of Peace',         aliases: ['shoes', 'feet', 'gospel of peace', 'shoes of peace'], points: 2 },
      { text: 'Shield of Faith',        aliases: ['shield', 'shield of faith', 'faith'],       points: 2 },
      { text: 'Helmet of Salvation',    aliases: ['helmet', 'helmet of salvation', 'salvation'], points: 2 },
      { text: 'Sword of the Spirit',    aliases: ['sword', 'sword of the spirit', 'word of god'], points: 3 },
    ],
  },
  {
    id: 'twelve-disciples',
    title: 'Name one of the 12 Disciples',
    subtitle: 'Matthew 10:2-4',
    answers: [
      { text: 'Peter',      aliases: ['peter', 'simon peter', 'cephas'],           points: 1 },
      { text: 'Andrew',     aliases: ['andrew'],                                    points: 1 },
      { text: 'James',      aliases: ['james', 'james son of zebedee'],             points: 1 },
      { text: 'John',       aliases: ['john'],                                      points: 1 },
      { text: 'Philip',     aliases: ['philip'],                                    points: 2 },
      { text: 'Bartholomew',aliases: ['bartholomew', 'nathanael'],                  points: 2 },
      { text: 'Matthew',    aliases: ['matthew', 'levi'],                           points: 2 },
      { text: 'Thomas',     aliases: ['thomas', 'doubting thomas'],                 points: 2 },
      { text: 'James (son of Alphaeus)', aliases: ['james son of alphaeus', 'james alphaeus'], points: 3 },
      { text: 'Thaddaeus',  aliases: ['thaddaeus', 'judas son of james', 'lebbaeus'], points: 3 },
      { text: 'Simon the Zealot', aliases: ['simon the zealot', 'simon zealot', 'simon canaanite'], points: 3 },
      { text: 'Judas Iscariot', aliases: ['judas', 'judas iscariot'],               points: 2 },
    ],
  },
  {
    id: 'plagues-of-egypt',
    title: 'Name a Plague of Egypt',
    subtitle: 'Exodus 7-12',
    answers: [
      { text: 'Blood',      aliases: ['blood', 'water to blood', 'river of blood'],  points: 1 },
      { text: 'Frogs',      aliases: ['frogs'],                                       points: 1 },
      { text: 'Lice',       aliases: ['lice', 'gnats', 'insects'],                   points: 2 },
      { text: 'Flies',      aliases: ['flies', 'swarms of flies'],                   points: 2 },
      { text: 'Livestock Disease', aliases: ['livestock', 'disease of livestock', 'cattle', 'murrain'], points: 2 },
      { text: 'Boils',      aliases: ['boils', 'sores'],                             points: 2 },
      { text: 'Hail',       aliases: ['hail', 'hailstorm'],                          points: 2 },
      { text: 'Locusts',    aliases: ['locusts'],                                    points: 2 },
      { text: 'Darkness',   aliases: ['darkness', 'dark'],                           points: 2 },
      { text: 'Death of the Firstborn', aliases: ['firstborn', 'death of firstborn', 'death'], points: 3 },
    ],
  },
  {
    id: 'books-of-paul',
    title: 'Name a Book Written by Paul',
    subtitle: 'New Testament Epistles',
    answers: [
      { text: 'Romans',         aliases: ['romans'],               points: 1 },
      { text: '1 Corinthians',  aliases: ['1 corinthians', 'first corinthians', 'corinthians'], points: 1 },
      { text: '2 Corinthians',  aliases: ['2 corinthians', 'second corinthians'], points: 2 },
      { text: 'Galatians',      aliases: ['galatians'],            points: 2 },
      { text: 'Ephesians',      aliases: ['ephesians'],            points: 2 },
      { text: 'Philippians',    aliases: ['philippians'],          points: 2 },
      { text: 'Colossians',     aliases: ['colossians'],           points: 2 },
      { text: '1 Thessalonians',aliases: ['1 thessalonians', 'thessalonians'], points: 2 },
      { text: '2 Thessalonians',aliases: ['2 thessalonians', 'second thessalonians'], points: 3 },
      { text: '1 Timothy',      aliases: ['1 timothy', 'timothy'],  points: 2 },
      { text: '2 Timothy',      aliases: ['2 timothy'],             points: 3 },
      { text: 'Titus',          aliases: ['titus'],                 points: 3 },
      { text: 'Philemon',       aliases: ['philemon'],              points: 3 },
    ],
  },
  {
    id: 'miracles-of-jesus',
    title: 'Name a Miracle of Jesus',
    subtitle: 'Gospels',
    answers: [
      { text: 'Water to Wine',      aliases: ['water to wine', 'turning water to wine', 'wine'],            points: 1 },
      { text: 'Feeding 5000',       aliases: ['feeding 5000', 'loaves and fish', 'feeding the multitude'], points: 1 },
      { text: 'Walking on Water',   aliases: ['walking on water', 'walk on water'],                        points: 1 },
      { text: 'Healing the Blind',  aliases: ['healing blind', 'blind', 'bartimaeus', 'sight to the blind'], points: 2 },
      { text: 'Raising Lazarus',    aliases: ['raising lazarus', 'lazarus', 'raise the dead'],             points: 2 },
      { text: 'Healing the Leper',  aliases: ['healing leper', 'leper', 'cleansing leper'],                points: 2 },
      { text: 'Calming the Storm',  aliases: ['calming storm', 'storm', 'calm the storm'],                 points: 2 },
      { text: 'Healing the Paralytic', aliases: ['paralytic', 'healing paralytic', 'take up your mat'],   points: 2 },
      { text: 'Raising Jairus Daughter', aliases: ['jairus', 'jairus daughter', 'raising girl'],           points: 3 },
      { text: 'Healing 10 Lepers', aliases: ['10 lepers', 'ten lepers'],                                   points: 3 },
    ],
  },
  {
    id: 'sons-of-jacob',
    title: "Name a Son of Jacob",
    subtitle: 'Genesis — The 12 Tribes',
    answers: [
      { text: 'Reuben',    aliases: ['reuben'],                 points: 1 },
      { text: 'Simeon',    aliases: ['simeon'],                 points: 2 },
      { text: 'Levi',      aliases: ['levi'],                   points: 2 },
      { text: 'Judah',     aliases: ['judah'],                  points: 1 },
      { text: 'Dan',       aliases: ['dan'],                    points: 2 },
      { text: 'Naphtali',  aliases: ['naphtali'],               points: 3 },
      { text: 'Gad',       aliases: ['gad'],                    points: 2 },
      { text: 'Asher',     aliases: ['asher'],                  points: 2 },
      { text: 'Issachar',  aliases: ['issachar'],               points: 3 },
      { text: 'Zebulun',   aliases: ['zebulun', 'zabulon'],     points: 3 },
      { text: 'Joseph',    aliases: ['joseph'],                 points: 1 },
      { text: 'Benjamin',  aliases: ['benjamin'],               points: 1 },
    ],
  },
  {
    id: 'women-of-faith',
    title: 'Name a Woman of Faith in the Bible',
    subtitle: 'Old & New Testament',
    answers: [
      { text: 'Ruth',     aliases: ['ruth'],                         points: 1 },
      { text: 'Esther',   aliases: ['esther'],                       points: 1 },
      { text: 'Mary',     aliases: ['mary', 'virgin mary'],          points: 1 },
      { text: 'Deborah',  aliases: ['deborah'],                      points: 2 },
      { text: 'Hannah',   aliases: ['hannah'],                       points: 2 },
      { text: 'Rahab',    aliases: ['rahab'],                        points: 2 },
      { text: 'Sarah',    aliases: ['sarah', 'sarai'],               points: 2 },
      { text: 'Priscilla',aliases: ['priscilla'],                    points: 3 },
      { text: 'Lydia',    aliases: ['lydia'],                        points: 3 },
      { text: 'Mary Magdalene', aliases: ['mary magdalene', 'magdalene'], points: 2 },
    ],
  },
  {
    id: 'names-of-god',
    title: 'Name a Name / Title of God in the Bible',
    subtitle: 'Old & New Testament',
    answers: [
      { text: 'Jehovah',    aliases: ['jehovah', 'yhwh', 'yahweh'],            points: 2 },
      { text: 'El Shaddai', aliases: ['el shaddai', 'shaddai', 'almighty'],    points: 2 },
      { text: 'Elohim',     aliases: ['elohim'],                                points: 2 },
      { text: 'Adonai',     aliases: ['adonai', 'lord'],                        points: 2 },
      { text: 'El Roi',     aliases: ['el roi', 'the god who sees'],            points: 3 },
      { text: 'Jehovah Jireh', aliases: ['jehovah jireh', 'the lord provides', 'provider'], points: 2 },
      { text: 'Jehovah Rapha', aliases: ['jehovah rapha', 'the lord heals', 'healer'],      points: 2 },
      { text: 'Jehovah Shalom', aliases: ['jehovah shalom', 'the lord is peace', 'peace'],  points: 3 },
      { text: 'Emmanuel',   aliases: ['emmanuel', 'immanuel', 'god with us'],   points: 2 },
      { text: 'Alpha and Omega', aliases: ['alpha and omega', 'alpha omega', 'beginning and end'], points: 2 },
    ],
  },
  {
    id: 'parables-of-jesus',
    title: 'Name a Parable of Jesus',
    subtitle: 'Gospels',
    answers: [
      { text: 'The Prodigal Son',    aliases: ['prodigal son', 'prodigal', 'lost son'],          points: 1 },
      { text: 'The Good Samaritan',  aliases: ['good samaritan', 'samaritan'],                   points: 1 },
      { text: 'The Lost Sheep',      aliases: ['lost sheep', '99 sheep'],                        points: 2 },
      { text: 'The Sower',           aliases: ['sower', 'parable of the sower', 'seeds'],        points: 2 },
      { text: 'The Talents',         aliases: ['talents', 'ten talents', 'parable of talents'],  points: 2 },
      { text: 'The Lost Coin',       aliases: ['lost coin', 'ten coins'],                        points: 2 },
      { text: 'The Mustard Seed',    aliases: ['mustard seed'],                                  points: 2 },
      { text: 'The Wise & Foolish Virgins', aliases: ['ten virgins', 'wise virgins', 'foolish virgins', 'virgins'], points: 3 },
      { text: 'The Rich Man & Lazarus', aliases: ['rich man and lazarus', 'lazarus and rich man', 'rich man lazarus'], points: 3 },
      { text: 'The Wedding Banquet', aliases: ['wedding banquet', 'wedding feast', 'marriage feast'], points: 3 },
    ],
  },
  {
    id: 'ten-commandments',
    title: 'Name one of the Ten Commandments',
    subtitle: 'Exodus 20',
    answers: [
      { text: 'No other gods',        aliases: ['no other gods', 'no other god', 'thou shalt have no other gods', 'one god'], points: 1 },
      { text: 'No idols',             aliases: ['no idols', 'no graven images', 'no image', 'idols'], points: 1 },
      { text: 'Do not misuse God\'s name', aliases: ['misuse name', 'lords name in vain', 'vain', 'name of the lord'], points: 2 },
      { text: 'Keep the Sabbath',     aliases: ['sabbath', 'keep sabbath', 'remember the sabbath', 'rest'], points: 1 },
      { text: 'Honour your parents',  aliases: ['honour parents', 'honor parents', 'father and mother', 'parents'], points: 1 },
      { text: 'Do not murder',        aliases: ['do not murder', 'thou shalt not kill', 'no murder', 'kill'], points: 1 },
      { text: 'Do not commit adultery', aliases: ['adultery', 'no adultery', 'do not commit adultery'], points: 2 },
      { text: 'Do not steal',         aliases: ['do not steal', 'no stealing', 'steal'], points: 1 },
      { text: 'Do not bear false witness', aliases: ['false witness', 'do not lie', 'bear false witness', 'lying'], points: 2 },
      { text: 'Do not covet',         aliases: ['do not covet', 'covet', 'covetousness'], points: 2 },
    ],
  },
  {
    id: 'gifts-of-spirit',
    title: 'Name a Gift of the Holy Spirit',
    subtitle: '1 Corinthians 12 & Romans 12',
    answers: [
      { text: 'Wisdom',        aliases: ['wisdom', 'word of wisdom'],                points: 1 },
      { text: 'Knowledge',     aliases: ['knowledge', 'word of knowledge'],           points: 1 },
      { text: 'Faith',         aliases: ['faith', 'gift of faith'],                   points: 1 },
      { text: 'Healing',       aliases: ['healing', 'gifts of healing'],              points: 1 },
      { text: 'Miracles',      aliases: ['miracles', 'working of miracles'],          points: 2 },
      { text: 'Prophecy',      aliases: ['prophecy', 'prophesying'],                  points: 2 },
      { text: 'Discernment',   aliases: ['discernment', 'discerning of spirits'],     points: 2 },
      { text: 'Tongues',       aliases: ['tongues', 'speaking in tongues', 'languages'], points: 2 },
      { text: 'Interpretation of Tongues', aliases: ['interpretation', 'interpret tongues'], points: 3 },
      { text: 'Teaching',      aliases: ['teaching'],                                  points: 2 },
      { text: 'Giving',        aliases: ['giving', 'generosity'],                     points: 2 },
      { text: 'Leadership',    aliases: ['leadership', 'governing', 'administration'], points: 2 },
    ],
  },
  {
    id: 'judges-of-israel',
    title: 'Name a Judge of Israel',
    subtitle: 'Book of Judges',
    answers: [
      { text: 'Gideon',    aliases: ['gideon', 'jerubbaal'],                    points: 1 },
      { text: 'Samson',    aliases: ['samson'],                                  points: 1 },
      { text: 'Deborah',   aliases: ['deborah'],                                 points: 1 },
      { text: 'Barak',     aliases: ['barak'],                                   points: 2 },
      { text: 'Jephthah',  aliases: ['jephthah'],                               points: 2 },
      { text: 'Ehud',      aliases: ['ehud'],                                    points: 2 },
      { text: 'Othniel',   aliases: ['othniel'],                                 points: 3 },
      { text: 'Shamgar',   aliases: ['shamgar'],                                 points: 3 },
      { text: 'Tola',      aliases: ['tola'],                                    points: 3 },
      { text: 'Samuel',    aliases: ['samuel'],                                  points: 1 },
    ],
  },
  {
    id: 'mountains-of-bible',
    title: 'Name a Mountain Mentioned in the Bible',
    subtitle: 'Old & New Testament',
    answers: [
      { text: 'Mount Sinai',    aliases: ['sinai', 'mount sinai', 'horeb', 'mount horeb'],    points: 1 },
      { text: 'Mount Zion',     aliases: ['zion', 'mount zion'],                               points: 1 },
      { text: 'Mount of Olives',aliases: ['mount of olives', 'olivet'],                        points: 1 },
      { text: 'Mount Carmel',   aliases: ['carmel', 'mount carmel'],                           points: 2 },
      { text: 'Mount Hermon',   aliases: ['hermon', 'mount hermon'],                           points: 2 },
      { text: 'Mount Ararat',   aliases: ['ararat', 'mount ararat'],                           points: 2 },
      { text: 'Mount Tabor',    aliases: ['tabor', 'mount tabor'],                             points: 3 },
      { text: 'Mount Moriah',   aliases: ['moriah', 'mount moriah'],                           points: 2 },
      { text: 'Mount Nebo',     aliases: ['nebo', 'mount nebo'],                               points: 3 },
    ],
  },
  {
    id: 'beatitudes',
    title: 'Complete a Beatitude — "Blessed are the..."',
    subtitle: 'Matthew 5:3-11',
    answers: [
      { text: 'Poor in spirit',    aliases: ['poor in spirit', 'poor', 'humble'],                     points: 1 },
      { text: 'Mourners',          aliases: ['mourn', 'mourners', 'those who mourn'],                  points: 1 },
      { text: 'Meek',              aliases: ['meek', 'gentle'],                                        points: 1 },
      { text: 'Hungry for righteousness', aliases: ['hunger', 'thirst', 'hunger and thirst', 'righteous'], points: 2 },
      { text: 'Merciful',          aliases: ['merciful', 'mercy'],                                     points: 2 },
      { text: 'Pure in heart',     aliases: ['pure in heart', 'pure heart', 'pure'],                  points: 2 },
      { text: 'Peacemakers',       aliases: ['peacemakers', 'peace'],                                  points: 2 },
      { text: 'Persecuted',        aliases: ['persecuted', 'persecution', 'suffer persecution'],       points: 3 },
    ],
  },
  {
    id: 'occupations-in-bible',
    title: 'Name an Occupation of a Bible Character',
    subtitle: 'Old & New Testament',
    answers: [
      { text: 'Fisherman',     aliases: ['fisherman', 'fisher', 'fishing'],                  points: 1 },
      { text: 'Shepherd',      aliases: ['shepherd', 'herdsman'],                             points: 1 },
      { text: 'Carpenter',     aliases: ['carpenter', 'woodworker'],                          points: 1 },
      { text: 'Tax Collector', aliases: ['tax collector', 'publican', 'tax'],                 points: 2 },
      { text: 'Tent Maker',    aliases: ['tent maker', 'tentmaker'],                          points: 2 },
      { text: 'Doctor',        aliases: ['doctor', 'physician', 'physician luke'],            points: 2 },
      { text: 'Farmer',        aliases: ['farmer', 'tiller', 'agriculture'],                 points: 2 },
      { text: 'King',          aliases: ['king', 'ruler'],                                    points: 1 },
      { text: 'Prophet',       aliases: ['prophet', 'seer'],                                  points: 1 },
      { text: 'Priest',        aliases: ['priest', 'high priest', 'levite'],                 points: 1 },
    ],
  },
  {
    id: 'rivers-in-bible',
    title: 'Name a River Mentioned in the Bible',
    subtitle: 'Geography of the Bible',
    answers: [
      { text: 'River Jordan',    aliases: ['jordan', 'river jordan'],          points: 1 },
      { text: 'River Nile',      aliases: ['nile', 'river nile', 'egypt river'], points: 1 },
      { text: 'River Euphrates', aliases: ['euphrates'],                        points: 2 },
      { text: 'River Tigris',    aliases: ['tigris', 'hiddekel'],              points: 2 },
      { text: 'River Gihon',     aliases: ['gihon'],                           points: 3 },
      { text: 'River Pishon',    aliases: ['pishon'],                          points: 3 },
      { text: 'River Abana',     aliases: ['abana'],                           points: 3 },
      { text: 'River Pharpar',   aliases: ['pharpar'],                         points: 3 },
    ],
  },
  {
    id: 'last-words-of-jesus',
    title: 'Name Something Jesus Said on the Cross',
    subtitle: 'The Seven Last Words',
    answers: [
      { text: 'Father forgive them', aliases: ['forgive them', 'father forgive', 'they know not what they do'], points: 1 },
      { text: 'Today you will be in paradise', aliases: ['paradise', 'today in paradise', 'with me in paradise'], points: 2 },
      { text: 'Woman behold your son', aliases: ['behold your son', 'woman behold', 'mother behold'], points: 2 },
      { text: 'My God why have you forsaken me', aliases: ['forsaken me', 'why forsaken', 'eli eli', 'eloi eloi'], points: 2 },
      { text: 'I am thirsty', aliases: ['thirsty', 'i thirst', 'i am thirsty'],              points: 2 },
      { text: 'It is finished', aliases: ['it is finished', 'tetelestai', 'finished'],        points: 1 },
      { text: 'Into your hands I commit my spirit', aliases: ['into your hands', 'commit my spirit', 'father hands'], points: 2 },
    ],
  },
  {
    id: 'major-prophets',
    title: 'Name a Major Prophet of the Old Testament',
    subtitle: 'The Five Major Prophets',
    answers: [
      { text: 'Isaiah',     aliases: ['isaiah'],      points: 1 },
      { text: 'Jeremiah',   aliases: ['jeremiah'],    points: 1 },
      { text: 'Lamentations', aliases: ['lamentations', 'jeremiah lamentations'], points: 3 },
      { text: 'Ezekiel',    aliases: ['ezekiel'],     points: 1 },
      { text: 'Daniel',     aliases: ['daniel'],      points: 1 },
    ],
  },
  {
    id: 'books-of-moses',
    title: 'Name a Book Written by Moses (Pentateuch)',
    subtitle: 'The First Five Books',
    answers: [
      { text: 'Genesis',     aliases: ['genesis', 'gen'],          points: 1 },
      { text: 'Exodus',      aliases: ['exodus', 'exo'],           points: 1 },
      { text: 'Leviticus',   aliases: ['leviticus', 'lev'],        points: 2 },
      { text: 'Numbers',     aliases: ['numbers', 'num'],          points: 2 },
      { text: 'Deuteronomy', aliases: ['deuteronomy', 'deut'],     points: 2 },
    ],
  },
  {
    id: 'kings-of-israel',
    title: 'Name a King of Israel or Judah',
    subtitle: 'Old Testament Kings',
    answers: [
      { text: 'Saul',        aliases: ['saul', 'king saul'],              points: 1 },
      { text: 'David',       aliases: ['david', 'king david'],            points: 1 },
      { text: 'Solomon',     aliases: ['solomon'],                        points: 1 },
      { text: 'Rehoboam',    aliases: ['rehoboam'],                      points: 2 },
      { text: 'Jeroboam',    aliases: ['jeroboam'],                      points: 2 },
      { text: 'Ahab',        aliases: ['ahab'],                          points: 2 },
      { text: 'Hezekiah',    aliases: ['hezekiah'],                      points: 2 },
      { text: 'Josiah',      aliases: ['josiah'],                        points: 2 },
      { text: 'Jehoshaphat', aliases: ['jehoshaphat'],                   points: 3 },
      { text: 'Nebuchadnezzar', aliases: ['nebuchadnezzar', 'nebuchadnezar', 'babylonian king'], points: 2 },
    ],
  },
  {
    id: 'tabernacle-items',
    title: 'Name an Item Found in the Tabernacle / Temple',
    subtitle: 'Exodus 25-40',
    answers: [
      { text: 'Ark of the Covenant', aliases: ['ark', 'ark of the covenant', 'ark of covenant'], points: 1 },
      { text: 'Menorah',             aliases: ['menorah', 'lampstand', 'golden lampstand', 'candlestick'], points: 2 },
      { text: 'Table of Shewbread',  aliases: ['shewbread', 'table of shewbread', 'showbread', 'bread of presence'], points: 2 },
      { text: 'Altar of Incense',    aliases: ['altar of incense', 'incense altar', 'golden altar'], points: 2 },
      { text: 'Bronze Altar',        aliases: ['bronze altar', 'altar of burnt offering', 'burnt offering altar'], points: 2 },
      { text: 'Bronze Laver',        aliases: ['laver', 'bronze laver', 'washing basin'],           points: 3 },
      { text: 'Veil',                aliases: ['veil', 'curtain', 'inner curtain'],                 points: 2 },
      { text: 'Mercy Seat',          aliases: ['mercy seat', 'atonement cover'],                    points: 3 },
    ],
  },
  {
    id: 'cities-of-bible',
    title: 'Name a Famous City in the Bible',
    subtitle: 'Old & New Testament Geography — 22 cities on the board',
    answers: [
      { text: 'Jerusalem',    aliases: ['jerusalem'],                                    points: 1 },
      { text: 'Bethlehem',    aliases: ['bethlehem'],                                    points: 1 },
      { text: 'Nazareth',     aliases: ['nazareth'],                                     points: 1 },
      { text: 'Jericho',      aliases: ['jericho'],                                      points: 1 },
      { text: 'Babylon',      aliases: ['babylon', 'babel'],                             points: 2 },
      { text: 'Nineveh',      aliases: ['nineveh', 'ninevah'],                           points: 2 },
      { text: 'Samaria',      aliases: ['samaria'],                                      points: 2 },
      { text: 'Damascus',     aliases: ['damascus'],                                     points: 2 },
      { text: 'Capernaum',    aliases: ['capernaum'],                                    points: 2 },
      { text: 'Antioch',      aliases: ['antioch'],                                      points: 2 },
      { text: 'Corinth',      aliases: ['corinth'],                                      points: 2 },
      { text: 'Ephesus',      aliases: ['ephesus'],                                      points: 2 },
      { text: 'Rome',         aliases: ['rome'],                                         points: 2 },
      { text: 'Bethany',      aliases: ['bethany'],                                      points: 2 },
      { text: 'Sodom',        aliases: ['sodom'],                                        points: 2 },
      { text: 'Hebron',       aliases: ['hebron'],                                       points: 3 },
      { text: 'Philippi',     aliases: ['philippi'],                                     points: 3 },
      { text: 'Athens',       aliases: ['athens'],                                       points: 3 },
      { text: 'Tarsus',       aliases: ['tarsus'],                                       points: 3 },
      { text: 'Ur',           aliases: ['ur', 'ur of the chaldeans', 'ur of chaldees'], points: 3 },
      { text: 'Beersheba',    aliases: ['beersheba', 'beer sheba'],                      points: 3 },
      { text: 'Bethel',       aliases: ['bethel'],                                       points: 3 },
    ],
  },
  {
    id: 'animals-of-bible',
    title: 'Name an Animal Mentioned in the Bible',
    subtitle: 'Old & New Testament — 15 animals on the board',
    answers: [
      { text: 'Lion',        aliases: ['lion', 'lions'],                                  points: 1 },
      { text: 'Lamb',        aliases: ['lamb', 'sheep'],                                  points: 1 },
      { text: 'Dove',        aliases: ['dove', 'pigeon'],                                 points: 1 },
      { text: 'Serpent',     aliases: ['serpent', 'snake', 'viper'],                      points: 1 },
      { text: 'Donkey',      aliases: ['donkey', 'ass', 'mule'],                          points: 2 },
      { text: 'Camel',       aliases: ['camel', 'camels'],                                points: 2 },
      { text: 'Eagle',       aliases: ['eagle', 'eagles'],                                points: 2 },
      { text: 'Raven',       aliases: ['raven', 'crow'],                                  points: 2 },
      { text: 'Fish',        aliases: ['fish', 'great fish', 'whale'],                    points: 2 },
      { text: 'Bear',        aliases: ['bear', 'bears'],                                  points: 2 },
      { text: 'Ox',          aliases: ['ox', 'oxen', 'bull'],                             points: 2 },
      { text: 'Locust',      aliases: ['locust', 'locusts'],                              points: 2 },
      { text: 'Sparrow',     aliases: ['sparrow'],                                        points: 3 },
      { text: 'Behemoth',    aliases: ['behemoth', 'hippopotamus'],                       points: 3 },
      { text: 'Leviathan',   aliases: ['leviathan'],                                      points: 3 },
    ],
  },
];

// Two well-known categories used when a session runs in test mode
export const TEST_CATEGORY_IDS = ['fruits-of-spirit', 'ten-commandments'];

// Pick N random categories for a game session
export function pickCategories(count: number): BibleCategory[] {
  const shuffled = [...BIBLE_CATEGORIES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Fuzzy-match an answer against a category's answer list.
// Only accepts answers from the predefined list — no free-text biblical knowledge.
export function matchAnswer(
  input: string,
  category: BibleCategory,
  alreadyFound: string[]
): CategoryAnswer | null {
  const normalized = input.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '');
  if (normalized.length < 2) return null;

  for (const answer of category.answers) {
    if (alreadyFound.includes(answer.text)) continue;
    const allForms = [answer.text.toLowerCase(), ...answer.aliases.map(a => a.toLowerCase())];
    if (allForms.some(form => {
      const normForm = form.replace(/[^a-z0-9 ]/g, '');
      // Exact match
      if (normForm === normalized) return true;
      // Phrase containment — require at least 4 chars to avoid short false positives
      // e.g. "belt" (4) matching "belt of truth", but "on" (2) must not match "solomon"
      if (normalized.length >= 4 && normForm.includes(normalized)) return true;
      if (normForm.length >= 4 && normalized.includes(normForm)) return true;
      return false;
    })) {
      return answer;
    }
  }
  return null;
}
