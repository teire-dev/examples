import { describe, expect, it } from "vitest";
import { firstProblem, intake } from "../src/intake.js";

const good = { id: 7, email: "ada@example.com", channel: "chat", subject: "Double charge" };

describe("intake", () => {
  it("accepts a valid ticket and fills defaults", () => {
    const result = intake(good);
    expect(result).toEqual({ ok: true, ticket: { ...good, labels: {} } });
  });

  it("lists every invalid field by path", () => {
    const result = intake({ ...good, id: -1, email: "nope", channel: "fax" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.problems.sort()).toEqual(["channel", "email", "id"]);
  });

  it("rejects unknown keys", () => {
    expect(intake({ ...good, extra: true }).ok).toBe(false);
  });

  it("names the first problem", () => {
    expect(firstProblem({ ...good, subject: "" })).toBe("subject");
    expect(firstProblem(good)).toBeNull();
  });
});
