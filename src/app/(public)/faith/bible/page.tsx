import { getLanguage } from "@/lib/lang";
import Link from "next/link";
import { Book, ChevronRight } from "lucide-react";

export const metadata = {
  title: "Bible - Priskat",
  description: "Read the Holy Bible",
};

const BIBLE_BOOKS = [
  {"no":1,"abbr":"Kej","name":"Kejadian","chapter":50},
  {"no":2,"abbr":"Kel","name":"Keluaran","chapter":40},
  {"no":3,"abbr":"Ima","name":"Imamat","chapter":27},
  {"no":4,"abbr":"Bil","name":"Bilangan","chapter":36},
  {"no":5,"abbr":"Ula","name":"Ulangan","chapter":34},
  {"no":6,"abbr":"Yos","name":"Yosua","chapter":24},
  {"no":7,"abbr":"Hak","name":"Hakim-hakim","chapter":21},
  {"no":8,"abbr":"Rut","name":"Rut","chapter":4},
  {"no":9,"abbr":"1 Sam","name":"1 Samuel","chapter":31},
  {"no":10,"abbr":"2 Sam","name":"2 Samuel","chapter":24},
  {"no":11,"abbr":"1 Raj","name":"1 Raja-Raja","chapter":22},
  {"no":12,"abbr":"2 Raj","name":"2 Raja-Raja","chapter":25},
  {"no":13,"abbr":"1 Taw","name":"1 Tawarikh","chapter":29},
  {"no":14,"abbr":"2 Taw","name":"2 Tawarikh","chapter":36},
  {"no":15,"abbr":"Ezr","name":"Ezra","chapter":10},
  {"no":16,"abbr":"Neh","name":"Nehemia","chapter":13},
  {"no":17,"abbr":"Est","name":"Ester","chapter":10},
  {"no":18,"abbr":"Ayb","name":"Ayub","chapter":42},
  {"no":19,"abbr":"Maz","name":"Mazmur","chapter":150},
  {"no":20,"abbr":"Ams","name":"Amsal","chapter":31},
  {"no":21,"abbr":"Pkh","name":"Pengkhotbah","chapter":12},
  {"no":22,"abbr":"Kid","name":"Kidung Agung","chapter":8},
  {"no":23,"abbr":"Yes","name":"Yesaya","chapter":66},
  {"no":24,"abbr":"Yer","name":"Yeremia","chapter":52},
  {"no":25,"abbr":"Rat","name":"Ratapan","chapter":5},
  {"no":26,"abbr":"Yeh","name":"Yehezkiel","chapter":48},
  {"no":27,"abbr":"Dan","name":"Daniel","chapter":12},
  {"no":28,"abbr":"Hos","name":"Hosea","chapter":14},
  {"no":29,"abbr":"Yoe","name":"Yoel","chapter":3},
  {"no":30,"abbr":"Amo","name":"Amos","chapter":9},
  {"no":31,"abbr":"Oba","name":"Obaja","chapter":1},
  {"no":32,"abbr":"Yun","name":"Yunus","chapter":4},
  {"no":33,"abbr":"Mik","name":"Mikha","chapter":7},
  {"no":34,"abbr":"Nah","name":"Nahum","chapter":3},
  {"no":35,"abbr":"Hab","name":"Habakuk","chapter":3},
  {"no":36,"abbr":"Zef","name":"Zefanya","chapter":3},
  {"no":37,"abbr":"Hag","name":"Hagai","chapter":2},
  {"no":38,"abbr":"Zak","name":"Zakharia","chapter":14},
  {"no":39,"abbr":"Mal","name":"Maleakhi","chapter":4},
  {"no":40,"abbr":"Mat","name":"Matius","chapter":28},
  {"no":41,"abbr":"Mar","name":"Markus","chapter":16},
  {"no":42,"abbr":"Luk","name":"Lukas","chapter":24},
  {"no":43,"abbr":"Yoh","name":"Yohanes","chapter":21},
  {"no":44,"abbr":"Kis","name":"Kisah Para Rasul","chapter":28},
  {"no":45,"abbr":"Rom","name":"Roma","chapter":16},
  {"no":46,"abbr":"1 Kor","name":"1 Korintus","chapter":16},
  {"no":47,"abbr":"2 Kor","name":"2 Korintus","chapter":13},
  {"no":48,"abbr":"Gal","name":"Galatia","chapter":6},
  {"no":49,"abbr":"Efe","name":"Efesus","chapter":6},
  {"no":50,"abbr":"Flp","name":"Filipi","chapter":4},
  {"no":51,"abbr":"Kol","name":"Kolose","chapter":4},
  {"no":52,"abbr":"1 Tes","name":"1 Tesalonika","chapter":5},
  {"no":53,"abbr":"2 Tes","name":"2 Tesalonika","chapter":3},
  {"no":54,"abbr":"1 Tim","name":"1 Timotius","chapter":6},
  {"no":55,"abbr":"2 Tim","name":"2 Timotius","chapter":4},
  {"no":56,"abbr":"Tit","name":"Titus","chapter":3},
  {"no":57,"abbr":"Flm","name":"Filemon","chapter":1},
  {"no":58,"abbr":"Ibr","name":"Ibrani","chapter":13},
  {"no":59,"abbr":"Yak","name":"Yakobus","chapter":5},
  {"no":60,"abbr":"1 Pet","name":"1 Petrus","chapter":5},
  {"no":61,"abbr":"2 Pet","name":"2 Petrus","chapter":3},
  {"no":62,"abbr":"1 Yoh","name":"1 Yohanes","chapter":5},
  {"no":63,"abbr":"2 Yoh","name":"2 Yohanes","chapter":1},
  {"no":64,"abbr":"3 Yoh","name":"3 Yohanes","chapter":1},
  {"no":65,"abbr":"Yud","name":"Yudas","chapter":1},
  {"no":66,"abbr":"Wah","name":"Wahyu","chapter":22}
];

export default async function BiblePage() {
  const lang = await getLanguage();
  const isId = lang === "id";

  return (
    <div className="w-full h-full pb-8">
      {/* Header */}
      <div className="bg-brand-surface pt-safe pb-6 px-4 shadow-3d-heavy relative overflow-hidden z-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="flex items-center space-x-3 mt-4 mb-2">
          <div className="w-10 h-10 rounded-full bg-[#1e1e1e] flex items-center justify-center shadow-inner-dark border border-[#333]">
            <Book className="h-5 w-5 text-brand-gold" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            {isId ? "Alkitab" : "Holy Bible"}
          </h1>
        </div>
        <p className="text-brand-muted text-sm px-1">
          {isId 
            ? "Pilih kitab untuk mulai membaca Firman Tuhan." 
            : "Select a book to start reading the Word of God."}
        </p>
      </div>

      {/* Book List */}
      <div className="px-4 mt-6">
        <div className="grid grid-cols-1 gap-3">
          {BIBLE_BOOKS.map((book) => (
            <Link 
              href={`/faith/bible/${book.no}/1`} 
              key={book.no}
              className="bg-brand-surface p-4 rounded-2xl flex items-center justify-between border border-[#333] border-t-[#444] border-l-[#444] shadow-3d active:translate-y-1 active:shadow-inner-dark transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-[#1e1e1e] flex items-center justify-center shadow-inner-dark text-brand-gold font-bold shrink-0">
                  {book.no}
                </div>
                <div>
                  <h3 className="text-brand-light font-medium text-lg">
                    {book.name}
                  </h3>
                  <p className="text-brand-muted text-xs">
                    {book.chapter} {isId ? 'Pasal' : 'Chapters'}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-brand-muted shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
