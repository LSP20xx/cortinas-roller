import React, { useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import { motion } from "framer-motion";
import {
  PhoneCall,
  Ruler,
  Sun,
  Moon,
  ShieldCheck,
  Hammer,
  Drill,
  Zap,
  Truck,
  BadgeCheck,
  Leaf,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// =====================
// UI SHIMS (sin shadcn/ui)
// =====================
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className = "",
  children,
  ...rest
}) => (
  <button
    className={`flex items-center px-6 py-3 rounded-lg border font-semibold shadow-md transition-all duration-200
      bg-[#A3B18A] text-[#44423F] border-[#A3B18A] hover:bg-[#C2B280] hover:border-[#C2B280] hover:shadow-lg
      focus:outline-none focus:ring-2 focus:ring-[#A3B18A] focus:ring-offset-2
      active:scale-95
      ${className}`}
    {...rest}
  >
    {children}
  </button>
);

const Card: React.FC<PropsWithChildren<{ className?: string }>> = ({
  className = "",
  children,
}) => (
  <div
    className={`rounded-2xl border bg-[#E3E0DB]/80 border-[#D6CFC4] ${className}`}
  >
    {children}
  </div>
);
const CardHeader: React.FC<PropsWithChildren<{ className?: string }>> = ({
  className = "",
  children,
}) => <div className={`px-4 pt-4 ${className}`}>{children}</div>;
const CardTitle: React.FC<PropsWithChildren<{ className?: string }>> = ({
  className = "",
  children,
}) => <div className={`text-xl font-semibold ${className}`}>{children}</div>;
const CardDescription: React.FC<PropsWithChildren<{ className?: string }>> = ({
  className = "",
  children,
}) => (
  <div className={`text-sm text-[#44423F]/80 ${className}`}>{children}</div>
);
const CardContent: React.FC<PropsWithChildren<{ className?: string }>> = ({
  className = "",
  children,
}) => <div className={`px-4 pb-4 ${className}`}>{children}</div>;

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (
  props
) => (
  <input
    {...props}
    className={`w-full border rounded-md px-3 py-2 bg-[#F8F6F3] text-[#44423F] border-[#D6CFC4] placeholder-[#A3B18A] focus:border-[#A3B18A] focus:ring-2 focus:ring-[#A3B18A] ${
      props.className || ""
    }`}
  />
);
const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (
  props
) => (
  <textarea
    {...props}
    className={`w-full border rounded-md px-3 py-2 bg-[#F8F6F3] text-[#44423F] border-[#D6CFC4] placeholder-[#A3B18A] focus:border-[#A3B18A] focus:ring-2 focus:ring-[#A3B18A] ${
      props.className || ""
    }`}
  />
);
const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({
  className = "",
  children,
  ...rest
}) => (
  <label className={`block mb-1 text-sm font-medium ${className}`} {...rest}>
    {children}
  </label>
);
const Badge: React.FC<PropsWithChildren<{ className?: string }>> = ({
  className = "",
  children,
}) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs bg-[#EADCD6] border-[#EADCD6] text-[#44423F] ${className}`}
  >
    {children}
  </span>
);

// ===== Config rápida =====
const WHATSAPP_NUMBER = "5491161955414"; // reemplazá por tu número (sin +)
const BRAND_NAME = "RollerPro"; // reemplazá por tu marca

// ===== Precios (ARS por m²) =====
const PRICE_TABLE: Record<"sunscreen5" | "sunscreen3" | "blackout", number> = {
  sunscreen5: 24000,
  sunscreen3: 26500,
  blackout: 31000,
};
const EXTRAS: {
  motorizado: number;
  instalacion: number;
  guia_lateral: number;
} = {
  motorizado: 95000,
  instalacion: 18000,
  guia_lateral: 9000,
};

type TelaKey = keyof typeof PRICE_TABLE; // "sunscreen5" | "sunscreen3" | "blackout"
type Accion = "cadena" | "motor";

// ===== Cotizador (lógica pura y testeable) =====
export function computeQuote(
  widthCm: number,
  heightCm: number,
  telaKey: TelaKey,
  accion: Accion,
  extras: { instalacion: boolean; guia: boolean }
) {
  const w = Math.max(45, widthCm) / 100; // metros
  const h = Math.max(45, heightCm) / 100; // metros
  const areaM2 = Math.max(1, w * h); // mínimo 1 m²

  const base = PRICE_TABLE[telaKey] * areaM2;
  const accionCosto = accion === "motor" ? EXTRAS.motorizado : 0;
  const extraInst = extras.instalacion ? EXTRAS.instalacion : 0;
  const extraGuia = extras.guia ? EXTRAS.guia_lateral : 0;

  const subtotal = base + accionCosto + extraInst + extraGuia;
  const iva = subtotal * 0.21;
  const total = Math.round(subtotal + iva);

  return {
    areaM2: Number(areaM2.toFixed(2)),
    base: Math.round(base),
    subtotal: Math.round(subtotal),
    iva: Math.round(iva),
    total,
  };
}

function useQuote(
  widthCm: number,
  heightCm: number,
  telaKey: TelaKey,
  accion: Accion,
  extras: { instalacion: boolean; guia: boolean }
) {
  return useMemo(
    () => computeQuote(widthCm, heightCm, telaKey, accion, extras),
    [widthCm, heightCm, telaKey, accion, extras]
  );
}

// ===== Slider de imágenes (con placeholders estables) =====
interface MediaItem {
  src: string;
  alt?: string;
}
const AMBIENT_MEDIA: MediaItem[] = [
  {
    src: "/img/Living.jpg",
    alt: "Living con cortinas roller",
  },
  {
    src: "/img/Dormitorio azul.jpg",
    alt: "Dormitorio blackout",
  },
  {
    src: "/img/Escritorio infantil.jpg",
    alt: "Oficina sunscreen",
  },
  {
    src: "/img/Living comedor 3.png",
    alt: "Detalle de cortinas",
  },
];

function MediaSlider({ items = AMBIENT_MEDIA }: { items?: MediaItem[] }) {
  const [index, setIndex] = React.useState(0);
  const length = items.length;
  const go = (i: number) => setIndex((i + length) % length);

  useEffect(() => {
    const id = setInterval(() => go(index + 1), 5000);
    return () => clearInterval(id);
  }, [index, length]);

  return (
    <div className="relative w-full h-full min-h-[100vh] min-w-[100vw] overflow-hidden">
      {items.map((m, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <img src={m.src} alt={m.alt} className="w-full h-full object-cover" />
        </div>
      ))}
      {/* Flechas centradas vertical y horizontalmente, con fondo más visible */}
      <div className="absolute inset-0 flex items-center justify-between pointer-events-none z-10">
        <button
          aria-label="Anterior"
          onClick={() => go(index - 1)}
          className="mx-4 bg-white/80 hover:bg-white text-slate-700 rounded-full p-3 shadow pointer-events-auto focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <ChevronLeft className="h-7 w-7" />
        </button>
        <button
          aria-label="Siguiente"
          onClick={() => go(index + 1)}
          className="mx-4 bg-white/80 hover:bg-white text-slate-700 rounded-full p-3 shadow pointer-events-auto focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <ChevronRight className="h-7 w-7" />
        </button>
      </div>
    </div>
  );
}

// ===== Catálogo con imágenes (placeholders) =====
const CATALOG: { name: string; img: string }[] = [
  {
    name: "Sunscreen 5% Light",
    img: "/img/Sala.jpg",
  },
  {
    name: "Sunscreen 3% Urban",
    img: "/img/Sala 2.jpg",
  },
  {
    name: "Blackout Premium",
    img: "/img/Ventana black out.jpg",
  },
  {
    name: "Blackout Texturado",
    img: "/img/Ventana black out 2.jpg",
  },
  {
    name: "Sunscreen Stone",
    img: "/img/Cocina.jpg",
  },
  {
    name: "Blackout Blanco",
    img: "/img/Cocina negra.jpg",
  },
];

// ===== Tests ligeros de runtime =====
function runQuoteTests() {
  const results: string[] = [];
  const assert = (cond: boolean, msg: string) =>
    results.push(`${cond ? "✅" : "❌"} ${msg}`);

  // Test 1: área mínima = 1 m² si pasan menos de 45cm
  {
    const q = computeQuote(30, 30, "sunscreen5", "cadena", {
      instalacion: false,
      guia: false,
    });
    assert(q.areaM2 === 1, `Área mínima 1 m² (obtuvo ${q.areaM2})`);
  }
  // Test 2: sin extras ni motor
  {
    const q = computeQuote(100, 100, "sunscreen5", "cadena", {
      instalacion: false,
      guia: false,
    });
    const base = PRICE_TABLE.sunscreen5 * 1; // 1 m²
    const expected = Math.round(base * 1.21);
    assert(
      q.total === expected,
      `Total sin extras correcto (${q.total} === ${expected})`
    );
  }
  // Test 3: con motor + instalación + guía
  {
    const q = computeQuote(120, 160, "blackout", "motor", {
      instalacion: true,
      guia: true,
    });
    const area = Math.max(
      1,
      (Math.max(45, 120) / 100) * (Math.max(45, 160) / 100)
    );
    const base = PRICE_TABLE.blackout * area;
    const subtotal =
      base + EXTRAS.motorizado + EXTRAS.instalacion + EXTRAS.guia_lateral;
    const expected = Math.round(subtotal * 1.21);
    assert(
      q.total === expected,
      `Total con extras correcto (${q.total} === ${expected})`
    );
  }
  // Test 4: dimensiones mínimas exactas 45x45 => 1 m²
  {
    const q = computeQuote(45, 45, "sunscreen3", "cadena", {
      instalacion: false,
      guia: false,
    });
    const base = PRICE_TABLE.sunscreen3 * 1;
    const expected = Math.round(base * 1.21);
    assert(
      q.total === expected,
      `Total mínimo correcto (${q.total} === ${expected})`
    );
  }
  // Test 5: cambio de tela modifica base
  {
    const q1 = computeQuote(100, 100, "sunscreen5", "cadena", {
      instalacion: false,
      guia: false,
    });
    const q2 = computeQuote(100, 100, "blackout", "cadena", {
      instalacion: false,
      guia: false,
    });
    assert(
      q2.base > q1.base,
      `Blackout debe ser más caro que Sunscreen 5% (${q2.base} > ${q1.base})`
    );
  }

  // eslint-disable-next-line no-console
  console.log("[QuoteTests]", ...results);
}

export default function RollerBlindsLanding() {
  const [width, setWidth] = useState(120);
  const [height, setHeight] = useState(160);
  const [tela, setTela] = useState<TelaKey>("sunscreen5");
  const [accion, setAccion] = useState<Accion>("cadena");
  const [withInst, setWithInst] = useState(true);
  const [withGuia, setWithGuia] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      runQuoteTests();
      // Evita el "gutter" oscuro en desktop por overflow horizontal
      document.body.classList.add("overflow-x-hidden");
      document.documentElement.classList.add("overflow-x-hidden");
      // Garantiza fondo claro del body detrás del wrapper
      document.body.classList.add("bg-slate-50");
    }
    return () => {
      document.body.classList.remove("overflow-x-hidden", "bg-slate-50");
      document.documentElement.classList.remove("overflow-x-hidden");
    };
  }, []);

  const quote = useQuote(width, height, tela, accion, {
    instalacion: withInst,
    guia: withGuia,
  });

  const waMsg = encodeURIComponent(
    `Hola! Quiero cotizar cortinas roller.\n\nMedidas: ${width}cm x ${height}cm\nTela: ${tela}\nAcción: ${accion}\nInstalación: ${
      withInst ? "Sí" : "No"
    }\nGuía lateral: ${withGuia ? "Sí" : "No"}\n\nPresupuesto estimado: $${
      quote.total
    } ARS (IVA inc.)\n\n¿Podemos coordinar una visita/asesoría?`
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-white to-slate-50 text-slate-800">
      {/* Header fijo con links */}
      <header className="fixed top-0 left-0 w-full z-50 backdrop-blur bg-[#F8F6F3]/95 border-b border-[#E3E0DB] shadow-sm">
        <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6" />
            <span className="font-bold text-lg">{BRAND_NAME}</span>
            <Badge className="ml-2">Cortinas Roller</Badge>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#catalogo"
              className="text-[#44423F] hover:text-[#A3B18A] font-medium transition-colors"
            >
              Catálogo
            </a>
            <a
              href="#cotizador"
              className="text-[#44423F] hover:text-[#A3B18A] font-medium transition-colors"
            >
              Cotizador
            </a>
            <a
              href="#contacto"
              className="text-[#44423F] hover:text-[#A3B18A] font-medium transition-colors"
            >
              Contacto
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button>
                <PhoneCall className="h-4 w-4 mr-2" /> Pedí tu cotización
              </Button>
            </a>
          </div>
        </nav>
      </header>
      {/* Espaciador para header fijo */}
      <div className="h-[72px]" />

      {/* Slider full screen */}
      <section className="relative w-screen h-screen min-h-[100vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <MediaSlider />
        </div>
        {/* Overlay para oscurecer un poco si se desea, opcional */}
        {/* <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none" /> */}
      </section>

      {/* Hero abajo del slider */}
      <section className="relative z-20 w-full bg-gradient-to-b from-white/90 to-slate-50/90 py-12 px-4 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl text-center"
        >
          <h1 className="text-4xl md:text-5xl font-black leading-tight">
            Elegí la luz, el confort y el estilo con{" "}
            <span className="underline decoration-wavy decoration-current">
              cortinas roller
            </span>
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Blackout y Sunscreen a medida. Instalación profesional en CABA y
            GBA. Asesoría sin cargo.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <BadgeCheck className="h-5 w-5" />
            <span>Garantía escrita</span>
            <Truck className="h-5 w-5 ml-4" />
            <span>Entrega rápida</span>
            <Leaf className="h-5 w-5 ml-4" />
            <span>Fácil limpieza</span>
          </div>
          <div className="mt-8 flex gap-3 justify-center">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button className="bg-slate-900 text-white border-slate-900">
                Cotizar ahora
              </Button>
            </a>
            <a href="#catalogo">
              <Button>Ver catálogo</Button>
            </a>
          </div>
        </motion.div>
      </section>

      {/* Beneficios */}
      <section className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5" /> Control de luz
              </CardTitle>
              <CardDescription>
                Filtrá rayos UV y reducí el encandilamiento sin perder vista.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Ideal para living y oficinas. Sunscreen 3% o 5%.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5" /> Descanso total
              </CardTitle>
              <CardDescription>
                Blackout para dormitorios, salas de proyección y consultorios.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Oscurecimiento superior y excelente aislación.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hammer className="h-5 w-5" /> A medida
              </CardTitle>
              <CardDescription>
                Fabricación local y colocación por técnicos calificados.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Garantía, repuestos y servicio post‑venta.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Catálogo con fotos */}
      <section id="catalogo" className="bg-white border-y scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl md:text-3xl font-extrabold">
            Catálogo rápido
          </h2>
          <p className="mt-2 text-slate-600">
            Colores y texturas más elegidos. Podés reemplazar estas tarjetas por
            tus colecciones.
          </p>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATALOG.map((item, i) => (
              <Card key={i} className="overflow-hidden group">
                <div className="h-40 overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <CardDescription>
                    Muestras a domicilio sin cargo*
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            *En CABA y zonas de GBA seleccionadas.
          </p>
        </div>
      </section>

      {/* Cotizador */}
      <section
        id="cotizador"
        className="mx-auto max-w-6xl px-4 py-12 scroll-mt-24"
      >
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" /> Calculá tu presupuesto
              </CardTitle>
              <CardDescription>
                Valores estimados con IVA. El precio final se confirma tras la
                medición.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="width">Ancho (cm)</Label>
                  <Input
                    id="width"
                    type="number"
                    min={45}
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="height">Alto (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    min={45}
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Tela</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2 bg-[#F8F6F3] text-[#44423F] border-[#D6CFC4] focus:border-[#A3B18A] focus:ring-2 focus:ring-[#A3B18A]"
                    value={tela}
                    onChange={(e) => setTela(e.target.value as TelaKey)}
                  >
                    <option value="sunscreen5">Sunscreen 5%</option>
                    <option value="sunscreen3">Sunscreen 3%</option>
                    <option value="blackout">Blackout</option>
                  </select>
                </div>
                <div>
                  <Label>Acción</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2 bg-[#F8F6F3] text-[#44423F] border-[#D6CFC4] focus:border-[#A3B18A] focus:ring-2 focus:ring-[#A3B18A]"
                    value={accion}
                    onChange={(e) => setAccion(e.target.value as Accion)}
                  >
                    <option value="cadena">Cadena</option>
                    <option value="motor">Motorizado</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center gap-2 text-sm select-none">
                  <input
                    type="checkbox"
                    checked={withInst}
                    onChange={(e) => setWithInst(e.target.checked)}
                  />
                  <span className="inline-flex items-center gap-2">
                    <Drill className="h-4 w-4" /> Con instalación
                  </span>
                </label>
                <label className="inline-flex items-center gap-2 text-sm select-none">
                  <input
                    type="checkbox"
                    checked={withGuia}
                    onChange={(e) => setWithGuia(e.target.checked)}
                  />
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> Guía lateral
                  </span>
                </label>
              </div>

              <div className="rounded-2xl border p-4 bg-white/60">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span>Área (m²)</span>
                  <span className="text-right font-medium">{quote.areaM2}</span>
                  <span>Base</span>
                  <span className="text-right">
                    ${quote.base.toLocaleString("es-AR")} ARS
                  </span>
                  <span>Subtotal</span>
                  <span className="text-right">
                    ${quote.subtotal.toLocaleString("es-AR")} ARS
                  </span>
                  <span>IVA 21%</span>
                  <span className="text-right">
                    ${quote.iva.toLocaleString("es-AR")} ARS
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold">Total estimado</span>
                  <span className="text-2xl font-black">
                    ${quote.total.toLocaleString("es-AR")} ARS
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button>Pedir asesoría por WhatsApp</Button>
                  </a>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button>Cotizar ahora</Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dejanos tus medidas</CardTitle>
              <CardDescription>
                Respondemos en el día de Lunes a Sábado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre</Label>
                    <Input placeholder="Tu nombre" />
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <Input placeholder="11 1234 5678" />
                  </div>
                </div>
                <div>
                  <Label>Zona/Barrio</Label>
                  <Input placeholder="Ej: Palermo, CABA" />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Ambientes</Label>
                    <Input type="number" placeholder="2" />
                  </div>
                  <div>
                    <Label>Ancho (cm)</Label>
                    <Input
                      type="number"
                      placeholder="120"
                      defaultValue={width}
                    />
                  </div>
                  <div>
                    <Label>Alto (cm)</Label>
                    <Input
                      type="number"
                      placeholder="160"
                      defaultValue={height}
                    />
                  </div>
                </div>
                <div>
                  <Label>Comentarios</Label>
                  <Textarea placeholder="Contanos qué necesitás (tela, colores, fecha, etc.)" />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="h-4 w-4" /> Tus datos están
                  protegidos. No compartimos información.
                </div>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button type="button">Enviar consulta</Button>
                </a>
                <p className="text-xs text-slate-500">
                  * Podés adjuntar fotos de tus ventanas por WhatsApp luego del
                  primer contacto.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonios */}
      <section className="bg-white border-y">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl md:text-3xl font-extrabold">
            Lo que dicen nuestros clientes
          </h2>
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            {[
              "Excelente calidad y terminación.",
              "Instalaron en tiempo récord.",
              "La asesoría nos ayudó a elegir el grado de apertura ideal.",
            ].map((t, i) => (
              <Card key={i}>
                <CardContent className="pt-6 text-slate-700">
                  “{t}”
                  <div className="mt-4 text-sm text-slate-500">
                    — Cliente {i + 1}, CABA
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-extrabold">
          Preguntas frecuentes
        </h2>
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>¿Cuánto tarda la entrega?</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-700 text-sm">
              Entre 3 y 7 días hábiles según zona y stock de tela.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>¿Trabajan con medidas exactas?</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-700 text-sm">
              Sí. Medimos y fabricamos a medida. La visita técnica confirma el
              precio final.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>¿Hacen motorizadas?</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-700 text-sm">
              Sí, con control remoto o Wi‑Fi. Compatible con domótica.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>¿Qué formas de pago aceptan?</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-700 text-sm">
              Transferencia, débito, crédito y cuotas según promo vigente.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contacto"
        className="bg-slate-900 text-slate-100 scroll-mt-24"
      >
        <div className="mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-lg font-bold">
              <ShieldCheck className="h-5 w-5" /> {BRAND_NAME}
            </div>
            <p className="mt-2 text-sm text-slate-300">
              Cortinas roller a medida en CABA y GBA. Asesoría sin cargo.
            </p>
          </div>
          <div>
            <div className="font-semibold mb-2">Contacto</div>
            <ul className="space-y-1 text-sm text-slate-300">
              <li>
                WhatsApp:{" "}
                <a
                  className="underline"
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Escribinos
                </a>
              </li>
              <li>
                Email:{" "}
                <a className="underline" href="mailto:ventas@rollerpro.com">
                  ventas@rollerpro.com
                </a>
              </li>
              <li>Horarios: Lun a Sáb 9–19 h</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Zonas</div>
            <p className="text-sm text-slate-300">
              CABA • Zona Norte • Zona Oeste • Zona Sur (consultar)
            </p>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-slate-400 flex items-center justify-between">
            <span>
              © {new Date().getFullYear()} {BRAND_NAME}. Todos los derechos
              reservados.
            </span>
            <span className="inline-flex items-center gap-1">
              Hecho con <Zap className="h-3 w-3" /> pasión.
            </span>
          </div>
        </div>
      </footer>

      {/* Botón fijo WhatsApp */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 rounded-full shadow-xl p-4 bg-green-500 text-white hover:scale-105 transition-transform"
        aria-label="WhatsApp"
      >
        <PhoneCall className="h-5 w-5" />
      </a>
    </div>
  );
}
