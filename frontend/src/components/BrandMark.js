import { jsx as _jsx } from "react/jsx-runtime";

const logoSrc = "/ChatGPT%20Image%20Sep%2022,%202026,%2009_59_39%20AM.png";

export function BrandMark({ className = "" }) {
  return _jsx("img", {
    src: logoSrc,
    alt: "Aradhna A4 logo",
    className: `object-contain ${className}`,
  });
}
