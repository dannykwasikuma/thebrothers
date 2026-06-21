import { useState, useEffect, useCallback } from "react";
import { X, ChevronRight, BookOpen } from "lucide-react";

const STORAGE_KEY = "brothers-tutorial-seen";

interface Step {
  title: string;
  body: string;
  selector?: string;
  position?: "top" | "bottom" | "left" | "right";
}

const STEPS: Step[] = [
  {
    title: "Welcome to The Brothers",
    body: "Ghana's premier catering and ushering services company. Let us show you around our world of excellence.",
  },
  {
    title: "Navigate with Ease",
    body: "Use the navigation bar to explore our Catering services, Ushering services, Gallery, Shop, and more.",
    selector: "[data-testid='nav-bar']",
    position: "bottom",
  },
  {
    title: "Book Our Services",
    body: "Click 'Book Now' to request our services for your next event — weddings, corporate functions, and more.",
    selector: "[data-testid='nav-book-now']",
    position: "bottom",
  },
  {
    title: "Shop Our Packages",
    body: "Browse our curated event packages and add them to your cart. We offer deals for every occasion and budget.",
    selector: "[data-testid='nav-shop']",
    position: "bottom",
  },
  {
    title: "Your Cart",
    body: "Your cart is always accessible here. Review your selections and proceed to checkout whenever you are ready.",
    selector: "[data-testid='nav-cart']",
    position: "bottom",
  },
  {
    title: "Contact Us Anytime",
    body: "Reach us via WhatsApp at 0547164110 or use our Contact page. We respond within 24 hours.",
    selector: "[data-testid='chatbot-toggle']",
    position: "right",
  },
  {
    title: "You Are All Set",
    body: "Welcome aboard! Explore our world of luxury hospitality. We look forward to making your next event unforgettable.",
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function getElementRect(selector: string): Rect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

interface TooltipStyle {
  top?: number | string;
  left?: number | string;
  transform?: string;
}

function getTooltipStyle(rect: Rect | null, position: string, vpW: number, vpH: number): TooltipStyle {
  if (!rect) return { top: "50%", left: "50%", transform: "translate(-50%,-50%)" };
  const PAD = 16;
  const TW = 320;
  switch (position) {
    case "bottom":
      return {
        top: rect.top + rect.height + PAD,
        left: Math.min(Math.max(rect.left + rect.width / 2 - TW / 2, PAD), vpW - TW - PAD),
      };
    case "top":
      return {
        top: rect.top - PAD - 160,
        left: Math.min(Math.max(rect.left + rect.width / 2 - TW / 2, PAD), vpW - TW - PAD),
      };
    case "right":
      return {
        top: rect.top + rect.height / 2 - 80,
        left: rect.left + rect.width + PAD,
      };
    case "left":
      return {
        top: rect.top + rect.height / 2 - 80,
        left: rect.left - TW - PAD,
      };
    default:
      return { top: "50%", left: "50%", transform: "translate(-50%,-50%)" };
  }
}

export default function SiteTutorial() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [vpW, setVpW] = useState(window.innerWidth);
  const [vpH, setVpH] = useState(window.innerHeight);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      // Small delay so page renders first
      const t = setTimeout(() => setActive(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const updateRect = useCallback(() => {
    const current = STEPS[step];
    if (current.selector) {
      setRect(getElementRect(current.selector));
    } else {
      setRect(null);
    }
    setVpW(window.innerWidth);
    setVpH(window.innerHeight);
  }, [step]);

  useEffect(() => {
    if (!active) return;
    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, [active, updateRect]);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "true");
    setActive(false);
    setStep(0);
  }

  function next() {
    if (step >= STEPS.length - 1) {
      dismiss();
    } else {
      setStep((s) => s + 1);
    }
  }

  // Public trigger — expose via window so the "Take a Tour" button can call it
  useEffect(() => {
    (window as any).__startBrothersTour = () => {
      setStep(0);
      setActive(true);
    };
    return () => { delete (window as any).__startBrothersTour; };
  }, []);

  if (!active) return null;

  const current = STEPS[step];
  const tooltipStyle = getTooltipStyle(rect, current.position ?? "center", vpW, vpH);
  const PADDING = 8;

  return (
    <div className="fixed inset-0 z-[9999]" style={{ pointerEvents: "auto" }}>
      {/* Dark overlay with spotlight cutout */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: "none" }}
      >
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left - PADDING}
                y={rect.top - PADDING}
                width={rect.width + PADDING * 2}
                height={rect.height + PADDING * 2}
                rx={8}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(13,10,7,0.82)"
          mask="url(#spotlight-mask)"
        />
        {rect && (
          <rect
            x={rect.left - PADDING}
            y={rect.top - PADDING}
            width={rect.width + PADDING * 2}
            height={rect.height + PADDING * 2}
            rx={8}
            fill="none"
            stroke="#C9A84C"
            strokeWidth={2}
          />
        )}
      </svg>

      {/* Tooltip card */}
      <div
        className="absolute rounded-2xl shadow-2xl"
        style={{
          ...tooltipStyle,
          width: 320,
          background: "#1A1410",
          border: "1.5px solid rgba(201,168,76,0.5)",
          padding: "20px 22px 16px",
          zIndex: 10000,
        }}
      >
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 p-1 rounded hover:bg-white/10 transition"
          aria-label="Skip tutorial"
        >
          <X size={16} color="#7A6A5A" />
        </button>

        {/* Step indicator */}
        <div className="flex gap-1.5 mb-3">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                flex: i === step ? 2 : 1,
                background: i <= step ? "#C9A84C" : "rgba(201,168,76,0.2)",
              }}
            />
          ))}
        </div>

        <h3
          className="text-base font-bold mb-2"
          style={{ color: "#C9A84C", fontFamily: "'Cinzel Decorative', serif" }}
        >
          {current.title}
        </h3>
        <p className="text-sm leading-relaxed mb-4" style={{ color: "#B8A99A" }}>
          {current.body}
        </p>

        <div className="flex items-center justify-between">
          <button
            onClick={dismiss}
            className="text-xs px-3 py-1.5 rounded-lg border transition hover:bg-white/5"
            style={{ borderColor: "rgba(201,168,76,0.25)", color: "#7A6A5A" }}
          >
            Skip Tour
          </button>
          <button
            onClick={next}
            data-testid="tutorial-next"
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-lg transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#C9A84C,#8B6914)", color: "#0D0A07" }}
          >
            {step >= STEPS.length - 1 ? "Get Started" : "Next"}
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * A small button to re-trigger the tutorial from anywhere (e.g. the navbar).
 */
export function TakeTourButton() {
  return (
    <button
      onClick={() => (window as any).__startBrothersTour?.()}
      data-testid="take-tour-button"
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition hover:bg-white/10"
      style={{ borderColor: "rgba(201,168,76,0.3)", color: "#C9A84C" }}
      aria-label="Take a site tour"
    >
      <BookOpen size={12} />
      Take a Tour
    </button>
  );
}
