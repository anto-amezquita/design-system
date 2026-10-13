import * as React from 'react';
import * as S from "@ds-stories/components/composition/Menu/Menu.stories";

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

// Owned: Open, WithGroupLabelsAndIcons, Overflow and DarkMode open the menu in
// a `play` function (userEvent.click on the trigger), which previews don't
// run. playOnMount mirrors it. Radix's DropdownMenu trigger opens on
// pointerdown (primary button, no ctrl), so that's the event dispatched.
function playOnMount(Story: any) {
  return function Played() {
    const ref = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
      const trigger = ref.current?.querySelector('button');
      trigger?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0, pointerType: 'mouse' }));
    }, []);
    return <div ref={ref}><Story /></div>;
  };
}

export const Default = /* Default */ compose(S, "Default");
export const Open = /* Open */ playOnMount(compose(S, "Open"));
export const WithGroupLabelsAndIcons = /* Group labels and icons */ playOnMount(compose(S, "WithGroupLabelsAndIcons"));
export const Overflow = /* Overflow menu (icon trigger, end-aligned) */ playOnMount(compose(S, "Overflow"));
export const DarkMode = /* Dark mode */ playOnMount(compose(S, "DarkMode"));
