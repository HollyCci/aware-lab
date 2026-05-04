// 把 367 个实物 sticker 按视频里出现过的分类组织起来。
// 分类来自原 App 的"分类管理"逻辑（电子设备/家居/穿戴/美妆/出行/数码周边等）。
import { getIcon } from './icons';

export type IconCategory = {
  id: string;
  name: string;
  emoji: string;
  iconNames: string[];
};

// 简单子串规则：把 iconName 划入分类
const RULES: { id: string; name: string; emoji: string; match: (n: string) => boolean }[] = [
  {
    id: 'electronics', name: '数码', emoji: '📱',
    match: (n) => /^(3d_handphone|3d_video|3d_printer|3d_joystick|3d_headphone|Camera|Cctv|Microphone|DJ_Mixer|Mp[34]|Speaker|Television|Radio|Vinyl|Headset|Game|Joystick|Robot|Laptop|Tablet|Computer|Monitor|Keyboard|Router|Console|Drone|Headphone|Phone|Camcorder)/i.test(n),
  },
  {
    id: 'home', name: '家居', emoji: '🛋',
    match: (n) => /^(Bed|Sofa|Chair|Desk|Table|Cabinet|Cupboard|Drawer|Closet|Bookcase|Book_shelf|Lamp|Chandelier|Curtain|Mirror|Pillow|Carpet|Rug|Vase|Painting|Picture|Frame|Plant|Pot|Wardrobe|Wall|Floor|Door|Window|Cushion|Furniture|Bench|Stool|Shelf|Cooker|Blender|Fridge|Oven|Microwave|Air_conditioner|Heater|Fan|Washing|Dryer|Iron|Vacuum|Dining|Coffee_table|Bedside|Nightstand|Hood|Sink|Toilet|Shower|Bathtub|Faucet|Towel|Soap|Toothbrush|Hair_dryer)/i.test(n),
  },
  {
    id: 'wear', name: '穿戴', emoji: '👕',
    match: (n) => /^(Shirt|Tshirt|Coat|Jacket|Suit|Dress|Skirt|Pants|Trousers|Jeans|Shorts|Hoodie|Sweater|Sweatshirt|Cap|Hat|Beanie|Scarf|Glove|Sock|Sneaker|Shoe|Boots|Sandals|Heels|Slippers|Belt|Tie|Bowtie|Underwear|Pajamas|Swimsuit|Backpack|Bag|Wallet|Purse|Watch|Sunglasses|Glasses|Mask|Hijab|Helmet|Chullo|Beret|Headband|Necklace|Earrings|Ring|Bracelet|Pendant|Brooch|Wedding|Diamonds|Crown|Tiara)/i.test(n),
  },
  {
    id: 'beauty', name: '美妆护理', emoji: '💄',
    match: (n) => /^(Lipstick|Eyeshadow|Eyeliner|Eyebrow|Foundation|Concealer|Powder|Blush|Bronzer|Mascara|Brush|Brushes|Bb_cream|Cream|Lotion|Serum|Toner|Cleanser|Mask|Sheet_mask|Sunscreen|Perfume|Cologne|Argan_oil|Essential_oil|Nail|Polish|Manicure|Pedicure|Razor|Shaver|Trimmer|Comb|Hair_tie|Curler|Straightener|Contact_lens|Skincare|Makeup)/i.test(n),
  },
  {
    id: 'travel', name: '出行', emoji: '🚗',
    match: (n) => /^(3d_car|Car|Bike|Bicycle|Motorbike|Motorcycle|Scooter|Skateboard|Roller|Bus|Train|Subway|Plane|Airplane|Helicopter|Boat|Ship|Yacht|Suitcase|Luggage|Baggage|Duffle|Travel|Map|Compass|Tent|Hiking|Camping|Backpacker|Beach|Surfboard|Snowboard|Ski)/i.test(n),
  },
  {
    id: 'instrument', name: '乐器', emoji: '🎸',
    match: (n) => /^(Accordion|Acoustic_guitar|Electric_guitar|Bass_guitar|Guitar|Piano|Keyboard|Violin|Cello|Drum|Drums|Trumpet|Saxophone|Flute|Harmonica|Xylophone|Clarinet|Tambourine|Bongo|Maracas|Triangle|Banjo|Mandolin|Ukulele|Harp|Microphone|Amplifier|Synth|Synthesizer|Mixer|Speaker|Turntable)/i.test(n),
  },
  {
    id: 'sport', name: '运动', emoji: '⚽',
    match: (n) => /^(Basketball|Football|Soccer|Baseball|Volleyball|Tennis|Badminton|Pingpong|Bowling|Cricket|Hockey|Rugby|Skate|Helmet|Dumbbell|Barbell|Yoga|Treadmill|Bicycle|Running|Swim|Surf|Ski|Snowboard|Boxing|Glove|Punch|Bag|Pool|Billiard|Dart|Chess|Cards|Game|Trophy|Medal|Sports|Gym|Workout|Fitness)/i.test(n),
  },
  {
    id: 'living', name: '生活杂物', emoji: '🧺',
    match: (n) => /^(Apartment|Appartment|Building|Cabin|Beach_house|Burning_house|Bamboo|Beetle|Chime|Case|Diamonds|Drawer|Drawers|Sphere|Pyramid|Cube|Box|Cylinder|Triangle|Plant|Flower|Tree|Stone|Crystal|Cactus|Pot)/i.test(n),
  },
];

let _cached: IconCategory[] | null = null;
let _allIcons: string[] | null = null;

function getAllIconNames(): string[] {
  if (_allIcons) return _allIcons;
  const modules = import.meta.glob('/src/assets/icons/*.png', { eager: true, query: '?url', import: 'default' });
  const names = Object.keys(modules)
    .map((p) => p.split('/').pop()!.replace(/@[123]x\.png$/, ''))
    .filter((n) =>
      // 只保留物品 sticker，去掉 UI 元素（icon_/bg_/tab_/launch/guide/edit/img/share 等）
      !/^(icon_|bg_|tab_|launch|guide|edit|img|share|sahre|capsule|mock_|appicon_)/i.test(n) &&
      // 也去掉一些非物品（emoji/flying 等）
      !/^(ice|flying|cricket|vip|dataStatistics|gradient|onboarding|coachmark|3d_emoji)/i.test(n)
    );
  _allIcons = Array.from(new Set(names)).sort();
  return _allIcons;
}

export function getCategorizedIcons(): IconCategory[] {
  if (_cached) return _cached;
  const all = getAllIconNames();
  const used = new Set<string>();
  const cats: IconCategory[] = RULES.map((r) => {
    const list = all.filter((n) => r.match(n)).slice(0, 80);
    list.forEach((n) => used.add(n));
    return { id: r.id, name: r.name, emoji: r.emoji, iconNames: list };
  });
  // 把没分类的扔到"其他"
  const others = all.filter((n) => !used.has(n)).slice(0, 80);
  if (others.length) {
    cats.push({ id: 'others', name: '其他', emoji: '🎁', iconNames: others });
  }
  // 第一档放 3d_ 系列（最精致）—— 视频里默认就是用 3d 图标
  const featured: IconCategory = {
    id: 'featured', name: '推荐', emoji: '⭐',
    iconNames: ['3d_handphone', '3d_video', '3d_printer', '3d_joystick', '3d_headphone', '3d_car'],
  };
  _cached = [featured, ...cats.filter((c) => c.iconNames.length > 0)];
  return _cached;
}

export function getIconUrl(name: string): string | undefined {
  return getIcon(name);
}
