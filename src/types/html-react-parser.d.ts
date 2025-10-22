declare module "html-react-parser" {
  import { ReactNode } from "react";

  // Minimal type describing a parsed HTML element
  interface HtmlElement {
    name: string; // e.g. 'p', 'strong', 'em', 'br'
    children: Array<HtmlElement | string>;
    attribs?: Record<string, string>;
  }

  type DOMNode = HtmlElement | string;

  interface Options {
    trim?: boolean;
  }

  function parse(html: string, options?: Options): ReactNode | DOMNode[];

  export default parse;
  export type { DOMNode, Options };
}
