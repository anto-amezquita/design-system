import * as React from 'react';
import * as S from "@ds-stories/components/composition/NavigationMenu/NavigationMenu.stories";

function compose(S: any, key: string) {
  const meta: any = S.default ?? {};
  const st: any = S[key];
  const args: any = { ...(meta.args ?? {}), ...(st && st.args ? st.args : {}) };
  // Storybook resolves argTypes.mapping (control value -> real arg) before
  // rendering; mirror that so mapped args don't render raw.
  const at: any = { ...(meta.argTypes ?? {}), ...(st && st.argTypes ? st.argTypes : {}) };
  for (const k of Object.keys(args)) {
    const m = at[k] && at[k].mapping;
    if (m && typeof m === 'object' && args[k] in m) args[k] = m[args[k]];
  }
  const title: string = typeof meta.title === 'string' ? meta.title : '';
  const ctx: any = {
    args, name: key, title, kind: title, id: '', componentId: '',
    globals: {}, viewMode: 'story',
    parameters: (st && st.parameters) ?? meta.parameters ?? {},
  };
  let render: (() => any) | null = null;
  if (st && typeof st.render === 'function') render = () => st.render(args, ctx);
  else if (typeof st === 'function') render = () => st(args, ctx);
  else if (typeof meta.render === 'function') render = () => meta.render(args, ctx);
  else {
    const C = (st && st.component) || meta.component;
    if (C) render = () => React.createElement(C, args);
  }
  if (!render) return () => null;
  // [].concat: a single function is legal CSF decorator shorthand. A
  // decorator returning undefined (stubbed addon) falls through to the inner
  // render — otherwise one unrecognized addon blanks the cell silently.
  const decorators: any[] = ([] as any[]).concat((st && st.decorators) ?? []).concat(meta.decorators ?? []);
  return decorators.reduce((inner: any, dec: any) => () => {
    const out = dec(inner, ctx);
    return out === undefined ? inner() : out;
  }, render);
}

// Owned: Open and DarkMode open the "Writing" group in a `play` function
// (userEvent.click), which previews don't run. playOnMount mirrors it. Like
// the story's play, it only acts from breakpoint.desktop up - the menu is
// hidden below 1024px (cfg.overrides.NavigationMenu.viewport is 1280 wide).
function playOnMount(Story: any) {
  return function Played() {
    const ref = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
      if (!window.matchMedia('(min-width: 1024px)').matches) return;
      const writing = Array.from(ref.current?.querySelectorAll('button') ?? []).find((b) => b.textContent?.trim() === 'Writing');
      writing?.focus(); // userEvent.click focuses the trigger first - that's the ring storybook shows
      writing?.click();
    }, []);
    return <div ref={ref}><Story /></div>;
  };
}

export const Default = /* Default */ compose(S, "Default");
export const Open = /* Group open, current link inside it */ playOnMount(compose(S, "Open"));
export const WithIcons = /* With icons */ compose(S, "WithIcons");
export const NoCurrentPage = /* No current page */ compose(S, "NoCurrentPage");
export const DarkMode = /* Dark mode */ playOnMount(compose(S, "DarkMode"));
