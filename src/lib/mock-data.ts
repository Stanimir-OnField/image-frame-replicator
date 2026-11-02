import tomatoes from "@/assets/tomatoes.jpg";
import cheese from "@/assets/cheese.jpg";
import honey from "@/assets/honey.jpg";
import eggs from "@/assets/eggs.jpg";
import vegetables from "@/assets/vegetables.jpg";
import bread from "@/assets/bread.jpg";
import farm from "@/assets/farm.jpg";
import hero from "@/assets/hero.jpg";
import type { Category, Conversation, Producer, Product, Review } from "./types";

export const images = { tomatoes, cheese, honey, eggs, vegetables, bread, farm, hero };

export const categories: Category[] = [
  { slug: "plodove", name: "Плодове", image: hero, count: 124 },
  { slug: "zelenchutsi", name: "Зеленчуци", image: vegetables, count: 238 },
  { slug: "mlechni", name: "Млечни продукти", image: cheese, count: 96 },
  { slug: "meso", name: "Месо", image: farm, count: 58 },
  { slug: "yaitsa", name: "Яйца", image: eggs, count: 41 },
  { slug: "med", name: "Мед", image: honey, count: 73 },
  { slug: "hlyab", name: "Хляб и печива", image: bread, count: 35 },
  { slug: "vino", name: "Вино и напитки", image: bread, count: 47 },
  { slug: "domashni", name: "Домашни продукти", image: tomatoes, count: 112 },
].map((category) => ({ ...category, id: category.slug }));

export const locations = ["София", "Пловдив", "Смолян", "Велико Търново", "Варна", "Стара Загора", "Бургас"];

export const producers: Producer[] = ([
  {
    id: "zelenata-dolina", name: "Ферма Зелената Долина", location: "с. Брестник, Пловдив", region: "Пловдив",
    description: "Сезонни зеленчуци, отгледани без пестициди в подножието на Родопите.",
    story: "Семейството ни обработва земята от три поколения. Отглеждаме розови домати, краставици и пипер по стари български сортове, поливаме с планинска вода и берем само узрели плодове. Вярваме, че истинската храна има вкус, аромат и история.",
    avatar: vegetables, cover: farm, rating: 4.9, reviewsCount: 128, categories: ["zelenchutsi", "plodove"],
    delivery: ["delivery", "pickup"], verified: true, phone: "+359 888 123 456", email: "zelenata.dolina@mail.bg",
    website: "zelenatadolina.bg", pickupInfo: "Всеки ден 8:00–19:00 във фермата. Събота – Капана, Пловдив.",
  },
  {
    id: "rodopsko-mlyako", name: "Мандра Родопско мляко", location: "гр. Смолян", region: "Смолян",
    description: "Сирене, кашкавал и кисело мляко от краве и овче мляко от свободна паша.",
    story: "Малка семейна мандра в сърцето на Родопите. Млякото събираме всяка сутрин от кравите и овцете на съседни стопани и го преработваме по традиционни рецепти – без сухо мляко, палмово масло и консерванти.",
    avatar: cheese, cover: farm, rating: 4.8, reviewsCount: 94, categories: ["mlechni"],
    delivery: ["courier", "pickup"], verified: true, phone: "+359 887 555 210", email: "mandra@rodopi.bg",
    pickupInfo: "Пон–Съб 9:00–17:00, ул. Родопи 14, Смолян.",
  },
  {
    id: "zlatna-pita", name: "Пчелин Златна пита", location: "с. Арбанаси, В. Търново", region: "Велико Търново",
    description: "Акациев, липов и билков мед, восък и прополис от собствен пчелин.",
    story: "Над 200 кошера, разположени сред акациеви гори и билкови ливади. Медът ни е суров, нефилтриран и лабораторно изследван.",
    avatar: honey, cover: hero, rating: 5.0, reviewsCount: 61, categories: ["med", "domashni"],
    delivery: ["courier", "delivery"], verified: true, phone: "+359 899 321 777", email: "zlatnapita@abv.bg",
    pickupInfo: "По предварителна уговорка.",
  },
  {
    id: "gradina-ivanovi", name: "Градина Иванови", location: "кв. Бояна, София", region: "София",
    description: "Свежи яйца от свободно отглеждани кокошки и домашни зеленчуци.",
    story: "Градина в покрайнините на София, където кокошките ни се разхождат свободно, а зеленчуците растат без химия. Доставяме лично в София всеки вторник и петък.",
    avatar: eggs, cover: farm, rating: 4.7, reviewsCount: 43, categories: ["yaitsa", "zelenchutsi"],
    delivery: ["delivery", "pickup"], verified: false, phone: "+359 878 444 909", email: "ivanovi@gmail.com",
    pickupInfo: "Сряда и събота, 10:00–14:00.",
  },
  {
    id: "staria-furn", name: "Пекарна Старата фурна", location: "гр. Стара Загора", region: "Стара Загора",
    description: "Хляб с квас, пълнозърнести питки и домашни козунаци, изпечени на дърва.",
    story: "Печем в стара фурна на дърва, с квас на повече от 15 години и брашно от местни мелници.",
    avatar: bread, cover: hero, rating: 4.6, reviewsCount: 37, categories: ["hlyab", "vino"],
    delivery: ["pickup", "delivery"], verified: true, phone: "+359 886 102 030", email: "furna@sz.bg",
    pickupInfo: "Всеки ден 7:00–13:00.",
  },
] as Array<Omit<Producer, "categoryNames" | "slug" | "latitude" | "longitude">>).map((producer) => ({
  ...producer,
  slug: producer.id,
  latitude: null,
  longitude: null,
  categoryNames: producer.categories,
}));

const p = (o: Omit<Product, "slug" | "producerSlug" | "categoryId" | "images" | "producerName" | "producerLocation" | "categoryName" | "viewsCount"> & { images?: string[]; img: string }): Product => ({
  ...o,
  slug: o.id,
  producerSlug: o.producerId,
  categoryId: o.category,
  producerName: "",
  producerLocation: "",
  categoryName: "",
  viewsCount: 0,
  images: o.images ?? [o.img, images.vegetables, images.farm],
});

export const products: Product[] = [
  p({ id: "rozovi-domati", name: "Розови домати", producerId: "zelenata-dolina", category: "zelenchutsi", price: 2.8, unit: "кг", img: tomatoes, images: [tomatoes, hero, vegetables], rating: 4.9, reviewsCount: 56, delivery: ["delivery", "pickup"], available: true, description: "Сочни розови домати от сорт „Бичи рог“, берани в деня на доставката. Отгледани на открито, без пестициди и изкуствени торове.", createdAt: "2026-09-20" }),
  p({ id: "krave-sirene", name: "Домашно краве сирене", producerId: "rodopsko-mlyako", category: "mlechni", price: 9.5, unit: "кг", img: cheese, images: [cheese, farm], rating: 4.8, reviewsCount: 41, delivery: ["courier", "pickup"], available: true, description: "Бяло саламурено сирене, зряло минимум 60 дни. Само краве мляко, сол и закваска.", createdAt: "2026-09-12" }),
  p({ id: "akatsiev-med", name: "Акациев мед", producerId: "zlatna-pita", category: "med", price: 8.0, unit: "бурк. 800 г", img: honey, images: [honey, hero], rating: 5.0, reviewsCount: 38, delivery: ["courier", "delivery"], available: true, description: "Светъл, нежен акациев мед, който кристализира бавно. Суров и нефилтриран.", createdAt: "2026-08-30" }),
  p({ id: "presni-yaitsa", name: "Пресни яйца", producerId: "gradina-ivanovi", category: "yaitsa", price: 0.35, unit: "бр.", img: eggs, images: [eggs, farm], rating: 4.7, reviewsCount: 29, delivery: ["delivery", "pickup"], available: true, description: "Яйца от свободно отглеждани кокошки, хранени със зърно и зеленина.", createdAt: "2026-09-28" }),
  p({ id: "krastavitsi", name: "Краставици", producerId: "zelenata-dolina", category: "zelenchutsi", price: 1.9, unit: "кг", img: vegetables, rating: 4.6, reviewsCount: 22, delivery: ["delivery", "pickup"], available: true, description: "Хрупкави краставици, подходящи за салата и туршия.", createdAt: "2026-09-25" }),
  p({ id: "kiselo-mlyako", name: "Домашно кисело мляко", producerId: "rodopsko-mlyako", category: "mlechni", price: 1.6, unit: "бурк. 500 г", img: cheese, rating: 4.9, reviewsCount: 64, delivery: ["courier", "pickup"], available: true, description: "Гъсто кисело мляко в стъклен буркан, с истински български бацил.", createdAt: "2026-09-18" }),
  p({ id: "hlyab-kvas", name: "Хляб с квас", producerId: "staria-furn", category: "hlyab", price: 3.2, unit: "бр.", img: bread, rating: 4.7, reviewsCount: 19, delivery: ["pickup", "delivery"], available: true, description: "Пълнозърнест хляб с дълга ферментация, изпечен на дърва.", createdAt: "2026-09-29" }),
  p({ id: "lipov-med", name: "Липов мед", producerId: "zlatna-pita", category: "med", price: 8.5, unit: "бурк. 800 г", img: honey, rating: 4.9, reviewsCount: 17, delivery: ["courier"], available: false, description: "Ароматен липов мед с лек ментов привкус.", createdAt: "2026-07-10" }),
  p({ id: "chushki", name: "Печени чушки", producerId: "gradina-ivanovi", category: "domashni", price: 4.5, unit: "бурк. 700 г", img: vegetables, rating: 4.8, reviewsCount: 12, delivery: ["delivery", "pickup"], available: true, description: "Печени на жар червени чушки в собствен сок.", createdAt: "2026-09-05" }),
  p({ id: "kashkaval", name: "Овчи кашкавал", producerId: "rodopsko-mlyako", category: "mlechni", price: 16.0, unit: "кг", img: cheese, rating: 4.9, reviewsCount: 27, delivery: ["courier", "pickup"], available: true, description: "Зрял овчи кашкавал с богат вкус.", createdAt: "2026-08-15" }),
  p({ id: "domati-cherri", name: "Чери домати", producerId: "zelenata-dolina", category: "plodove", price: 4.2, unit: "кг", img: tomatoes, rating: 4.5, reviewsCount: 9, delivery: ["delivery"], available: true, description: "Сладки чери домати, идеални за деца.", createdAt: "2026-09-27" }),
  p({ id: "kozunak", name: "Домашен козунак", producerId: "staria-furn", category: "hlyab", price: 7.5, unit: "бр.", img: bread, rating: 4.6, reviewsCount: 14, delivery: ["pickup"], available: true, description: "Ръчно сплетен козунак с масло и стафиди.", createdAt: "2026-09-01" }),
];

export const reviews: Review[] = [
  { id: "r1", producerId: "zelenata-dolina", author: "Мария Петрова", rating: 5, date: "2026-09-21", text: "Доматите имат вкуса от детството ми! Доставката беше точна, а стопаните – изключително любезни." },
  { id: "r2", producerId: "zelenata-dolina", author: "Георги Димитров", rating: 5, date: "2026-09-10", text: "Поръчвам всяка седмица. Всичко е свежо и добре опаковано." },
  { id: "r3", producerId: "zelenata-dolina", author: "Елена Стоянова", rating: 4, date: "2026-08-28", text: "Много вкусни краставици, само бих искала повече дни за доставка." },
  { id: "r4", producerId: "rodopsko-mlyako", author: "Иван Колев", rating: 5, date: "2026-09-15", text: "Най-доброто сирене, което съм купувал. Истинско!" },
  { id: "r5", producerId: "zlatna-pita", author: "Десислава Ненова", rating: 5, date: "2026-09-02", text: "Медът е невероятен, а опаковката – грижлива." },
];

export const reviewDistribution = [72, 18, 6, 3, 1]; // % for 5..1 stars

export const conversations: Conversation[] = [
  { id: "c1", with: "Мария Петрова", avatar: tomatoes, productId: "rozovi-domati", unread: 2, hasOlderMessages: false, messages: [
    { id: "m1", fromMe: false, text: "Здравейте, интересувам се от розовите домати. Имате ли 10 кг за събота?", time: "09:14", createdAt: "2026-11-02T09:14:00+02:00" },
    { id: "m2", fromMe: true, text: "Здравейте, Мария! Да, ще ги подготвим. Предпочитате доставка или вземане?", time: "09:30", createdAt: "2026-11-02T09:30:00+02:00" },
    { id: "m3", fromMe: false, text: "Вземане от Капана, ако е възможно.", time: "09:42", createdAt: "2026-11-02T09:42:00+02:00" },
    { id: "m4", fromMe: false, text: "И около колко часа ще бъдете там?", time: "09:43", createdAt: "2026-11-02T09:43:00+02:00" },
  ]},
  { id: "c2", with: "Георги Димитров", avatar: vegetables, productId: "krastavitsi", unread: 0, hasOlderMessages: false, messages: [
    { id: "m1", fromMe: false, text: "Може ли краставици за туршия – около 20 кг?", time: "Вчера", createdAt: "2026-11-01T11:05:00+02:00" },
    { id: "m2", fromMe: true, text: "Разбира се, следващата седмица ще имаме.", time: "Вчера", createdAt: "2026-11-01T11:20:00+02:00" },
  ]},
  { id: "c3", with: "Елена Стоянова", avatar: eggs, productId: "chushki", unread: 1, hasOlderMessages: false, messages: [
    { id: "m1", fromMe: false, text: "Здравейте, доставяте ли до Пловдив център?", time: "Пон", createdAt: "2026-10-26T16:40:00+02:00" },
  ]},
];
