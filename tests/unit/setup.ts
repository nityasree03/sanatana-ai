import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Remove each test's rendered screen before the next test starts.
afterEach(() => cleanup());
