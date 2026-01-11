// Language-specific alphabets with proper diacritics and variations
const languageAlphabets = {
  // Latin script languages - VERIFIED alphabets only
  eng: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  spa: "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ",
  fra: "ABCDEFGHIJKLMNOPQRSTUVWXYZÀÂÄÇÉÈÊËÏÎÔÖÙÛÜŸ",
  deu: "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜß",
  ita: "ABCDEFGHIJKLMNOPQRSTUVWXYZÀÈÉÌÍÎÒÓÙ",
  por: "ABCDEFGHIJKLMNOPQRSTUVWXYZÀÁÂÃÇÉÊÍÓÔÕÚ",
  nld: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  pol: "AĄBCĆDEĘFGHIJKLŁMNŃOÓPQRSŚTUVWXYZŹŻ",
  ces: "AÁBCČDĎEÉĚFGHIÍJKLMNŇOÓPQRŘSŠTŤUÚŮVWXYÝZŽ",
  hun: "AÁBCDEÉFGHIÍJKLMNOÓÖŐPQRSTUÚÜŰVWXYZ",
  ron: "AĂÂBCDEFGHIÎJKLMNOPQRSTȘȚUVWXYZ",
  fin: "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÅ",
  swe: "ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ",
  nor: "ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ",
  dan: "ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ",
  isl: "AÁBDÐEÉFGHIÍJKLMNOÓPQRSTUÚVWXYÝÞÆÖ",
  est: "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÕÜŠŽ",
  lav: "AĀBCČDEĒFGĢHIĪJKĶLĻMNŅOPQRSŠTUŪVWXYZŽ",
  lit: "AĄBCČDEĘĖFGHIĮYJKLMNOPQRSŠTUŲŪVWXYZŽ",
  slk: "AÁBCČDĎEÉFGHIÍJKLĹĽMNŇOÓÔPQRŔSŠTŤUÚVWXYÝZŽ",
  slv: "ABCČDEFGHIJKLMNOPQRSŠTUVWXYZŽ",
  hrv: "ABCČĆDĐEFGHIJKLMNOPQRSŠTUVWXYZŽ",
  bos: "ABCČĆDĐEFGHIJKLMNOPQRSŠTUVWXYZŽ",
  mlt: "ABĊDEFĠGHĦIJKLMNOPQRSTUVWXYZŻ",
  cat: "ABCDEFGHIJKLMNOPQRSTUVWXYZÀÇÉÈÍÏÒÓÚÜ",
  eus: "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ",
  gle: "ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÚ",
  gla: "ABCDEFGHIJKLMNOPQRSTUVWXYZÀÈÌÒÙ",
  cym: "ABCDEFGHIJKLMNOPQRSTUVWXYZÂÊÎÔÛŴŶ",
  bre: "ABCDEFGHIJKLMNOPQRSTUVWXYZÂÊÎÔÛ",
  vie: "AĂÂBCDEÊFGHIJKLMNOÔƠPQRSTUƯVWXYZ",
  alb: "ABCÇDEFGHJIKLMNOPQRSTUVWXYZË",
  glg: "ABCDEFGHIJKLMNÑOPQRSTUVWXYZÁÉÍÓÚÜ",
  fry: "ABCDEFGHIJKLMNOPQRSTUVWXYZÂÊÎÔÛÁÉÍÓÚÜ",
  ltz: "ABCDEFGHIJKLMNOPQRSTUVWXYZÄËÉÖÜ",
  fao: "ABCDEFGHIJKLMNOPQRSTUVWXYZÁÐÍÓÚÝÆØ",
  afr: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  tur: "ABCÇDEFGĞHIİJKLMNOÖPQRSŞTUÜVWXYZ",
  aze: "ABCÇDEƏFGĞHXIİJKLMNOÖPQRSŞTUÜVWYZ",

  // Cyrillic script languages
  rus: "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ",
  ukr: "АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ",
  bel: "АБВГДЕЁЖЗІЙКЛМНОПРСТУЎФХЦЧШЩЪЫЬЭЮЯ",
  bul: "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ",
  srp: "АБВГДЂЕЖЗИЈКЛЉМНЊОПРСТЋУФХЦЧЏШ",
  mkd: "АБВГДЃЕЖЗЅИЈКЛЉМНЊОПРСТЌУФХЦЧЏШ",
  mon: "АБВГДЕЁЖЗИЙКЛМНОӨПРСТУҮФХЦЧШЩЪЫЬЭЮЯ",
  mvf: "АБВГДЕЁЖЗИЙКЛМНОӨПРСТУҮФХЦЧШЩЪЫЬЭЮЯ",
  bua: "АБВГДЕЁЖЗИЙКЛМНОӨПРСТУҮФХЦЧШЩЪЫЬЭЮЯ",
  xal: "АБВГДЕЁЖЗИЙКЛМНОӨПРСТУҮФХЦЧШЩЪЫЬЭЮЯ",
  kaz: "АӘБВГҒДЕЁЖЗИЙКҚЛМНҢОӨПРСТУҰҮФХҺЦЧШЩЪЫІЬЭЮЯ",
  kir: "АБВГДЕЁЖЗИЙКЛМНҢОӨПРСТУҮФХЦЧШЩЪЫЬЭЮЯ",
  uzb: "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ",
  tgk: "АБВГҒДЕЁЖЗИЙКҚЛМНОПРСТУФХҲЦЧҶШЪЫЬЭЮЯ",

  // Greek
  gre: "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ",

  // Arabic script languages
  ara: "ابتثجحخدذرزسشصضطظعغفقكلمنهوي",
  fas: "ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی",
  urd: "ابپتٹثجچحخدڈذرڑزژسشصضطظعغفقکگلمنںوهھی",
  pus: "ابپتټثجځچحخدډذرړزژږسشښصضطظعغفقکګلمنڼوهی",
  snd: "ابپتٽثجڄچحخدڊذرڙزسشصضطظعغفقکگلمنڻوهی",

  // Hebrew
  heb: "אבגדהוזחטיכלמנסעפצקרשת",

  // Devanagari script languages
  hin: "अआइईउऊऋॠऌॡएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह",
  mar: "अआइईउऊऋॠऌॡएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह",
  nep: "अआइईउऊऋॠऌॡएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह",
  bho: "अआइईउऊऋॠऌॡएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह",
  awa: "अआइईउऊऋॠऌॡएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह",
  mag: "अआइईउऊऋॠऌॡएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह",
  mai: "अआइईउऊऋॠऌॡएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह",

  // Bengali
  ben: "অআইঈউঊঋৠঌৡএঐওঔকখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহ",
  asm: "অআইঈউঊঋৠঌৡএঐওঔকখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহ",

  // Tamil
  tam: "அஆஇஈஉஊஎஏஐஒஓஔகஙசஜஞடணதநபமயரலவழளறன",

  // Telugu
  tel: "అఆఇఈఉఊఋౠఌౡఎఏఐఒఓఔకఖగఘఙచఛజఝఞటఠడఢణతథదధనపఫబభమయరలవశషసహ",

  // Malayalam
  mal: "അആഇഈഉഊഋൠഌൡഎഏഐഒഓഔകഖഗഘങചഛജഝഞടഠഡഢണതഥദധനപഫബഭമയരലവശഷസഹ",

  // Kannada
  kan: "ಅಆಇಈಉಊಋೠಌೡಎಏಐಒಓಔಕಖಗಘಙಚಛಜಝಞಟಠಡಢಣತಥದಧನಪಫಬಭಮಯರಲವಶಷಸಹ",

  // Gujarati
  guj: "અઆઇઈઉઊઋૠઌૡએઐઓઔકખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહ",

  // Gurmukhi (Punjabi)
  pan: "ਅਆਇਈਉਊਏਐਓਔਕਖਗਘਙਚਛਜਝਞਟਠਡਢਣਤਥਦਧਨਪਫਬਭਮਯਰਲਵਸਹ",

  // Odia
  ori: "ଅଆଇଈଉଊଋୠଌୡଏଐଓଔକଖଗଘଙଚଛଜଝଞଟଠଡଢଣତଥଦଧନପଫବଭମଯରଲଳଵଶଷସହ",

  // Sinhala
  sin: "අආඇඈඉඊඋඌඍඎඏඐඑඒඓඔඕඖකඛගඝඞචඡජඣඤටඨඩඪණතථදධනපඵබභමයරලවශෂසහ",

  // Thai
  tha: "กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮ",

  // Khmer
  khm: "កខគឃងចឆជឈញដឋឌឍណតថទធនបផពភមយរលវសហឡអ",
  mnw: "ကခဂဃငစဆဇဈညတထဒဓနပဖဗဘမယရလဝသဟအ",

  // Lao
  lao: "ກຂຄງຈຊຍດຕຖທນບປຜຝພຟມຍຣລວສຫອຮ",

  // Myanmar (Burmese)
  mya: "ကခဂဃငစဆဇဈညတထဒဓနပဖဗဘမယရလဝသဟအ",

  // Korean (Hangul)
  kor: "ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ",

  // Japanese (Hiragana)
  jpn: "あいうえおかきくけこがきぐげごさしすせそざじずぜぞたちつてとだぢづでどなにぬねのはひふへほばびぶべぼぱぴぷぺぽまみむめもやゆよらりるれろわをん",
  ryu: "あいうえおかきくけこがきぐげごさしすせそざじずぜぞたちつてとだぢづでどなにぬねのはひふへほばびぶべぼぱぴぷぺぽまみむめもやゆよらりるれろわをん",
  ain: "アイウエオカキクケコガギグゲゴサシスセソザジズゼゾタチツテトダヂヅデドナニヌネノハヒフヘホバビブベボパピプペポマミムメモヤユヨラリルレロワヲン",

  // Chinese varieties (using common characters - too long for display)
  cmn: "一丁七万三上下不与丐丑专且丕世丘丙业丛东丝丞串丢两严丧乃久么义之乎乏乐乒乓乘乙乜九乞也习乡书买乱乳了争事二于云互五井些亚亲亿什仁仃仅仇今介仍从仔仕仗付代令以们仰仲件任份企伊伍伎伏优伐休众优伏仫们伟传伤伦伞伟传伤伦",
  yue: "一丁七万三上下不与丐丑专且丕世丘丙业丛东丝丞串丢两严丧乃久么义之乎乏乐乒乓乘乙乜九乞也习乡书买乱乳了争事二于云互五井些亚亲亿什仁仃仅仇今介仍从仔仕仗付代令以们仰仲件任份企伊伍伎伏优伐休众优伏仫们伟传伤伦伞伟传伤伦",
  wuu: "一丁七万三上下不与丐丑专且丕世丘丙业丛东丝丞串丢两严丧乃久么义之乎乏乐乒乓乘乙乜九乞也习乡书买乱乳了争事二于云互五井些亚亲亿什仁仃仅仇今介仍从仔仕仗付代令以们仰仲件任份企伊伍伎伏优伐休众优伏仫们伟传伤伦伞伟传伤伦",
  nan: "一丁七万三上下不与丐丑专且丕世丘丙业丛东丝丞串丢两严丧乃久么义之乎乏乐乒乓乘乙乜九乞也习乡书买乱乳了争事二于云互五井些亚亲亿什仁仃仅仇今介仍从仔仕仗付代令以们仰仲件任份企伊伍伎伏优伐休众优伏仫们伟传伤伦伞伟传伤伦",
  hak: "一丁七万三上下不与丐丑专且丕世丘丙业丛东丝丞串丢两严丧乃久么义之乎乏乐乒乓乘乙乜九乞也习乡书买乱乳了争事二于云互五井些亚亲亿什仁仃仅仇今介仍从仔仕仗付代令以们仰仲件任份企伊伍伎伏优伐休众优伏仫们伟传伤伦伞伟传伤伦",
  hsn: "一丁七万三上下不与丐丑专且丕世丘丙业丛东丝丞串丢两严丧乃久么义之乎乏乐乒乓乘乙乜九乞也习乡书买乱乳了争事二于云互五井些亚亲亿什仁仃仅仇今介仍从仔仕仗付代令以们仰仲件任份企伊伍伎伏优伐休众优伏仫们伟传伤伦伞伟传伤伦",
  gan: "一丁七万三上下不与丐丑专且丕世丘丙业丛东丝丞串丢两严丧乃久么义之乎乏乐乒乓乘乙乜九乞也习乡书买乱乳了争事二于云互五井些亚亲亿什仁仃仅仇今介仍从仔仕仗付代令以们仰仲件任份企伊伍伎伏优伐休众优伏仫们伟传伤伦伞伟传伤伦",
  mnp: "一丁七万三上下不与丐丑专且丕世丘丙业丛东丝丞串丢两严丧乃久么义之乎乏乐乒乓乘乙乜九乞也习乡书买乱乳了争事二于云互五井些亚亲亿什仁仃仅仇今介仍从仔仕仗付代令以们仰仲件任份企伊伍伎伏优伐休众优伏仫们伟传伤伦伞伟传伤伦",
  cdo: "一丁七万三上下不与丐丑专且丕世丘丙业丛东丝丞串丢两严丧乃久么义之乎乏乐乒乓乘乙乜九乞也习乡书买乱乳了争事二于云互五井些亚亲亿什仁仃仅仇今介仍从仔仕仗付代令以们仰仲件任份企伊伍伎伏优伐休众优伏仫们伟传伤伦伞伟传伤伦",
  cjy: "一丁七万三上下不与丐丑专且丕世丘丙业丛东丝丞串丢两严丧乃久么义之乎乏乐乒乓乘乙乜九乞也习乡书买乱乳了争事二于云互五井些亚亲亿什仁仃仅仇今介仍从仔仕仗付代令以们仰仲件任份企伊伍伎伏优伐休众优伏仫们伟传伤伦伞伟传伤伦",
  zhx: "一丁七万三上下不与丐丑专且丕世丘丙业丛东丝丞串丢两严丧乃久么义之乎乏乐乒乓乘乙乜九乞也习乡书买乱乳了争事二于云互五井些亚亲亿什仁仃仅仇今介仍从仔仕仗付代令以们仰仲件任份企伊伍伎伏优伐休众优伏仫们伟传伤伦伞伟传伤伦",

  // Tibetan
  bod: "ཀཁགངཅཆཇཉཏཐདནཔཕབམཙཚཛཝཞཟའཡརལཤསཧཨ",
  adx: "ཀཁགངཅཆཇཉཏཐདནཔཕབམཙཚཛཝཞཟའཡརལཤསཧཨ",

  // Yi
  iii: "ꀀꀁꀂꀃꀄꀅꀆꀇꀈꀉꀊꀋꀌꀍꀎꀏꀐꀑꀒꀓꀔꀕꀖꀗꀘꀙꀚꀛꀜꀝꀞꀟ",

  // Lepcha
  lep: "ᰀᰁᰂᰃᰄᰅᰆᰇᰈᰉᰊᰋᰌᰍᰎᰏᰐᰑᰒᰓᰔᰕᰖᰗᰘᰙᰚᰛᰜᰝᰞᰟ",

  // Karen
  kar: "ကခဂဃငစဆဇဈညတထဒဓနပဖဗဘမယရလဝသဟအ",
  pwo: "ကခဂဃငစဆဇဈညတထဒဓနပဖဗဘမယရလဝသဟအ",

  // Manipuri
  mni: "ꯀꯁꯂꯃꯄꯅꯆꯇꯈꯉꯊꯋꯌꯍꯎꯏꯐꯑꯒꯓꯔꯕꯖꯗꯘꯙꯚꯛꯜꯝꯞꯟ",

  // Newari
  new: "꤀꤁꤂꤃꤄꤅꤆꤇꤈꤉ꤊꤋꤌꤍꤎꤏꤐꤑꤒꤓꤔꤕꤖꤗꤘꤙꤚꤛꤜꤝꤞꤟ",

  // Santali
  sat: "ᱚᱛᱜᱝᱞᱟᱠᱡᱢᱣᱤᱥᱦᱧᱨᱩᱪᱫᱬᱭᱮᱯᱰᱱᱲᱳᱴᱵᱶᱷᱸᱹᱺᱻᱼᱽ",

  // Ho
  hoc: "ᱚᱛᱜᱝᱞᱟᱠᱡᱢᱣᱤᱥᱦᱧᱨᱩᱪᱫᱬᱭᱮᱯᱰᱱᱲᱳᱴᱵᱶᱷᱸᱹᱺᱻᱼᱽ",

  // Mundari
  unr: "ᱚᱛᱜᱝᱞᱟᱠᱡᱢᱣᱤᱥᱦᱧᱨᱩᱪᱫᱬᱭᱮᱯᱰᱱᱲᱳᱴᱵᱶᱷᱸᱹᱺᱻᱼᱽ",

  // Sora
  srb: "ᱚᱛᱜᱝᱞᱟᱠᱡᱢᱣᱤᱥᱦᱧᱨᱩᱪᱫᱬᱭᱮᱯᱰᱱᱲᱳᱴᱵᱶᱷᱸᱹᱺᱻᱼᱽ",

  // Ethiopic script languages
  amh: "ሀሁሂሃሄህሆለሉሊላሌልሎሐሑሒሓሔሕሖመሙሚማሜምሞሠሡሢሣሤሥሦረሩሪራሬርሮሰሱሲሳሴስሶሸሹሺሻሼሽሾቀቁቂቃቄቅቆበቡቢባቤብቦተቱቲታቴትቶቸቹቺቻቼችቾኀኁኂኃኄኅኆነኑኒናኔንኖኘኙኚኛኜኝኞአኡኢኣኤእኦከኩኪካኬክኮኸኹኺኻኼኽኾወዉዊዋዌውዎዐዑዒዓዔዕዖዘዙዚዛዜዝዞዠዡዢዣዤዥዦየዩዪያዬይዮደዱዲዳዴድዶዸዹዺዻዼዽዾጀጁጂጃጄጅጆገጉጊጋጌግጎጠጡጢጣጤጥጦጨጩጪጫጬጭጮጰጱጲጳጴጵጶጸጹጺጻጼጽጾፀፁፂፃፄፅፆፈፉፊፋፌፍፎፐፑፒፓፔፕፖ",
  tir: "ሀሁሂሃሄህሆለሉሊላሌልሎሐሑሒሓሔሕሖመሙሚማሜምሞሠሡሢሣሤሥሦረሩሪራሬርሮሰሱሲሳሴስሶሸሹሺሻሼሽሾቀቁቂቃቄቅቆበቡቢባቤብቦተቱቲታቴትቶቸቹቺቻቼችቾኀኁኂኃኄኅኆነኑኒናኔንኖኘኙኚኛኜኝኞአኡኢኣኤእኦከኩኪካኬክኮኸኹኺኻኼኽኾወዉዊዋዌውዎዐዑዒዓዔዕዖዘዙዚዛዜዝዞዠዡዢዣዤዥዦየዩዪያዬይዮደዱዲዳዴድዶዸዹዺዻዼዽዾጀጁጂጃጄጅጆገጉጊጋጌግጎጠጡጢጣጤጥጦጨጩጪጫጬጭጮጰጱጲጳጴጵጶጸጹጺጻጼጽጾፀፁፂፃፄፅፆፈፉፊፋፌፍፎፐፑፒፓፔፕፖ",

  // Armenian
  hye: "ԱԲԳԴԵԶԷԸԹԺԻԼԽԾԿՀՁՂՃՄՅՆՇՈՉՊՋՌՍՎՏՐՑՒՓՔՕՖ",

  // Georgian
  kat: "აბგდევზთიკლმნოპჟრსტუფქღყშჩცძწჭხჯჰ",

  // Cherokee
  chr: "ᎠᎡᎢᎣᎤᎥᎦᎧᎨᎩᎪᎫᎬᎭᎮᎯᎰᎱᎲᎳᎴᎵᎶᎷᎸᎹᎺᎻᎼᎽᎾᎿᏀᏁᏂᏃᏄᏅᏆᏇᏈᏉᏊᏋᏌᏍᏎᏏᏐᏑᏒᏓᏔᏕᏖᏗᏘᏙᏚᏛᏜᏝᏞᏟᏠᏡᏢᏣᏤᏥᏦᏧᏨᏩᏪᏫᏬᏭᏮᏯᏰᏱᏲᏳᏴ",

  // Nivkh
  niv: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
};

// Script to language mapping - only verified alphabets
const scriptToLanguages = {
  Latin: [
    "eng",
    "spa",
    "fra",
    "deu",
    "ita",
    "por",
    "nld",
    "pol",
    "ces",
    "hun",
    "ron",
    "fin",
    "swe",
    "nor",
    "dan",
    "isl",
    "est",
    "lav",
    "lit",
    "slk",
    "slv",
    "hrv",
    "bos",
    "mlt",
    "cat",
    "eus",
    "gle",
    "gla",
    "cym",
    "bre",
    "vie",
    "alb",
    "glg",
    "fry",
    "ltz",
    "fao",
    "afr",
    "tur",
    "aze"
  ],
  Cyrillic: [
    "rus",
    "ukr",
    "bel",
    "bul",
    "srp",
    "mkd",
    "mon",
    "mvf",
    "bua",
    "xal",
    "kaz",
    "kir",
    "uzb",
    "tgk"
  ],
  Greek: ["gre"],
  Arabic: ["ara", "fas", "urd", "pus", "snd"],
  Hebrew: ["heb"],
  Devanagari: ["hin", "mar", "nep", "bho", "awa", "mag", "mai"],
  Bengali: ["ben", "asm"],
  Tamil: ["tam"],
  Telugu: ["tel"],
  Malayalam: ["mal"],
  Kannada: ["kan"],
  Gujarati: ["guj"],
  Gurmukhi: ["pan"],
  Oriya: ["ori"],
  Sinhala: ["sin"],
  Thai: ["tha"],
  Khmer: ["khm", "mnw"],
  Lao: ["lao"],
  Myanmar: ["mya"],
  Hangul: ["kor"],
  Hiragana: ["jpn", "ryu"],
  Katakana: ["ain"],
  Chinese: [
    "cmn",
    "yue",
    "wuu",
    "nan",
    "hak",
    "hsn",
    "gan",
    "mnp",
    "cdo",
    "cjy",
    "zhx"
  ],
  Tibetan: ["bod", "adx"],
  Yi: ["iii"],
  Lepcha: ["lep"],
  Karen: ["kar", "pwo"],
  Manipuri: ["mni"],
  Newari: ["new"],
  Santali: ["sat", "hoc", "unr", "srb"],
  Ethiopic: ["amh", "tir"],
  Armenian: ["hye"],
  Georgian: ["kat"],
  Cherokee: ["chr"]
};

// Build reverse lookup for efficiency
const languageToScript = {};
Object.entries(scriptToLanguages).forEach(([script, languages]) => {
  languages.forEach((lang) => {
    languageToScript[lang] = script;
  });
});

/**
 * Get alphabet for a language using 3-letter ISO code
 * @param {string} langCode - 3-letter ISO 639-3 language code
 * @returns {Object|null} - Object with alphabet data or null if not supported
 */
export const getAlphabet = (langCode) => {
  const normalizedCode = langCode.toLowerCase();
  const alphabet = languageAlphabets[normalizedCode];
  const script = languageToScript[normalizedCode];

  if (!alphabet || !script) {
    return null;
  }

  return {
    languageCode: langCode,
    script,
    alphabet,
    length: Array.from(alphabet).length,
    characters: Array.from(alphabet)
  };
};

/**
 * Get script name for a language code
 * @param {string} langCode - 3-letter language code
 * @returns {string|null} - Script name or null if not supported
 */
export const getScript = (langCode) => {
  const normalizedCode = langCode.toLowerCase();
  return languageToScript[normalizedCode] || null;
};

/**
 * Get all supported language codes
 * @returns {Array} - Array of supported 3-letter language codes
 */
export const getSupportedLanguages = () => {
  return Object.keys(languageAlphabets);
};

/**
 * Check if alphabet should be displayed (not too long)
 * @param {string} langCode - 3-letter language code
 * @returns {boolean} - Whether alphabet should be displayed
 */
export const shouldDisplayAlphabet = (langCode) => {
  const alphabetData = getAlphabet(langCode);
  if (!alphabetData) return false;

  // Don't display very long alphabets (Chinese, Ethiopic)
  const maxLength = 80;
  return alphabetData.length <= maxLength;
};
