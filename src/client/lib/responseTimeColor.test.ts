import { describe, it, expect } from "vitest";
import { getResponseTimeZone } from "./responseTimeColor";

const T = { greenBelow: 7, amberBelow: 14 };

describe("getResponseTimeZone", () => {
	it("avgDays < greenBelow → 'green'", () => {
		expect(getResponseTimeZone(3, T)).toBe("green");
		expect(getResponseTimeZone(6.9, T)).toBe("green");
	});

	it("greenBelow <= avgDays < amberBelow → 'amber'", () => {
		expect(getResponseTimeZone(10, T)).toBe("amber");
		expect(getResponseTimeZone(13.9, T)).toBe("amber");
	});

	it("avgDays >= amberBelow → 'red'", () => {
		expect(getResponseTimeZone(14, T)).toBe("red");
		expect(getResponseTimeZone(20, T)).toBe("red");
	});

	it("avgDays === null → 'none'", () => {
		expect(getResponseTimeZone(null, T)).toBe("none");
	});

	it("boundary: avgDays exactly greenBelow → 'amber' (strict <)", () => {
		expect(getResponseTimeZone(7, T)).toBe("amber");
	});
});
