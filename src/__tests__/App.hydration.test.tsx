// @vitest-environment jsdom
import { act, fireEvent, waitFor, within } from "@testing-library/react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "@/App";
import { DEFAULT_BUILDER_LANGUAGE } from "@/i18n/config";
import i18n from "@/i18n";
import { buildDefaultSEOConfig } from "@/config/seo";
import { defaultConfig } from "@/lib/docker-compose/defaultConfig";
import { resetConfig } from "@/lib/docker-compose/slice";
import { store } from "@/lib/store";

vi.mock("@/services/clarityService", () => ({
  initializeClarity: vi.fn(),
}));

vi.mock("@/lib/docker-compose/providerConfigLoader", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/docker-compose/providerConfigLoader")>();
  return {
    ...actual,
    initializeProviderConfig: vi.fn().mockResolvedValue(undefined),
  };
});

describe("Astro React workspace hydration", () => {
  let root: Root | undefined;
  let container: HTMLDivElement;

  beforeEach(async () => {
    store.dispatch(resetConfig());
    localStorage.clear();
    await i18n.changeLanguage(DEFAULT_BUILDER_LANGUAGE);
    container = document.createElement("div");
    document.body.appendChild(container);
    document.documentElement.classList.remove("is-hydrated", "light", "dark");
    document.documentElement.classList.add("dark");

    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Promotion source unavailable in test")));
  });

  afterEach(async () => {
    if (root) {
      await act(async () => root?.unmount());
      root = undefined;
    }
    container.remove();
    localStorage.clear();
    document.documentElement.classList.remove("is-hydrated", "light", "dark");
    vi.unstubAllGlobals();
  });

  it("hydrates deterministic markup, restores saved preferences, edits and exports YAML, and updates language metadata", async () => {
    const savedConfig = {
      ...defaultConfig,
      containerName: "saved-builder",
      workdirPath: "/srv/hagicode",
      anthropicAuthToken: "test-token",
    };
    localStorage.setItem("docker-compose-config-version", "2.13");
    localStorage.setItem("docker-compose-config", JSON.stringify(savedConfig));
    localStorage.setItem("language", "en-US");
    localStorage.setItem("theme", "light");

    const initialRenderTime = "2026-09-29T18:00:00.000Z";
    const markup = renderToString(<App initialRenderTime={initialRenderTime} />);
    container.innerHTML = markup;
    expect(container.textContent).toContain("container_name: hagicode-app");

    const recoverableErrors: unknown[] = [];
    await act(async () => {
      root = hydrateRoot(container, <App initialRenderTime={initialRenderTime} />, {
        onRecoverableError: (error) => recoverableErrors.push(error),
      });
    });

    const ui = within(container);
    const httpPort = ui.getByLabelText(/http port/i) as HTMLInputElement;
    await waitFor(() => expect(httpPort.value).toBe("45000"));
    await waitFor(() => expect(container.textContent).toContain("container_name: saved-builder"));
    await waitFor(() => expect(document.documentElement.lang).toBe("en-US"));
    await waitFor(() => expect(document.documentElement.classList.contains("light")).toBe(true));
    expect(document.title).toBe(buildDefaultSEOConfig("en-US").title);
    expect(recoverableErrors).toEqual([]);

    fireEvent.change(httpPort, { target: { value: "45001" } });
    expect(container.textContent).toContain("45001:45000");
    expect(JSON.parse(localStorage.getItem("docker-compose-config") ?? "{}").httpPort).toBe("45001");

    const createObjectURL = vi.fn(() => "blob:compose-export");
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revokeObjectURL });
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    const downloadButton = [...container.querySelectorAll("button")].find(
      (button) => button.textContent?.trim() === "Download",
    );

    expect(downloadButton).toBeDefined();
    expect(downloadButton?.disabled).toBe(false);
    fireEvent.click(downloadButton!);
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(anchorClick).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledOnce();

    await act(async () => {
      await i18n.changeLanguage(DEFAULT_BUILDER_LANGUAGE);
    });
    expect(document.documentElement.lang).toBe(DEFAULT_BUILDER_LANGUAGE);
    expect(document.title).toBe(buildDefaultSEOConfig(DEFAULT_BUILDER_LANGUAGE).title);
    expect(localStorage.getItem("language")).toBe(DEFAULT_BUILDER_LANGUAGE);

    const alternateLanguages = [...document.querySelectorAll<HTMLLinkElement>('link[rel="alternate"]')]
      .map((link) => link.hreflang);
    expect(new Set(alternateLanguages).size).toBe(alternateLanguages.length);
  });
});
