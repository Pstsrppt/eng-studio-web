// @vitest-environment jsdom
import { act, createElement, type ComponentType, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ActionPanel } from "./pinned-bar";

const Panel = ActionPanel as ComponentType<{ className: string; children?: ReactNode }>;
const NAME = "--action-panel-h";
const published = () => document.documentElement.style.getPropertyValue(NAME);

let root: Root;
let host: HTMLDivElement;
let resized: () => void;
const observed: Element[] = [];

const panel = () => host.firstElementChild as HTMLElement;
const render = (className: string, text = "a") => act(async () => root.render(createElement(Panel, { className }, text)));
const setHeight = (px: number) => Object.defineProperty(panel(), "offsetHeight", { configurable: true, value: px });

beforeEach(() => {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  observed.length = 0;
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback: () => void) { resized = callback; }
    observe(el: Element) { observed.push(el); }
    disconnect() { observed.length = 0; }
  });
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  document.head.querySelector("style")?.remove();
  vi.unstubAllGlobals();
});

function pinnedWhenClass(position: string) {
  const style = document.createElement("style");
  style.textContent = `.pinned { position: ${position}; }`;
  document.head.append(style);
}

describe("ActionPanel", () => {
  it("publishes its measured height while pinned, and follows it", async () => {
    pinnedWhenClass("fixed");
    await render("pinned");
    setHeight(64);
    await act(async () => resized());
    expect(published()).toBe("64px");
    setHeight(102);
    await act(async () => resized());
    expect(published()).toBe("102px");
  });

  it("has the new height ready when a parent's layout effect runs, before any resize notice", async () => {
    pinnedWhenClass("sticky");
    await render("pinned");
    setHeight(120);
    await render("pinned", "b");
    expect(published()).toBe("120px");
  });

  it("publishes zero when not pinned, so nothing leaves room for a bar in the flow", async () => {
    await render("flow");
    setHeight(64);
    await act(async () => resized());
    expect(published()).toBe("0px");
  });

  it("notices a media query unpinning it without a change of size", async () => {
    pinnedWhenClass("fixed");
    await render("pinned");
    setHeight(64);
    await act(async () => resized());
    document.head.querySelector("style")!.textContent = ".pinned { position: static; }";
    await act(async () => { window.dispatchEvent(new Event("resize")); });
    expect(published()).toBe("0px");
  });

  it("clears the height and stops watching when it goes", async () => {
    pinnedWhenClass("fixed");
    await render("pinned");
    expect(observed).toEqual([panel()]);
    await act(async () => root.render(null));
    expect(published()).toBe("");
    expect(observed).toEqual([]);
  });
});
