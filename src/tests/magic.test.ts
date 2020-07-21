import { assert } from "chai";
import { magic } from "../commands/magic";
import { Message } from "discord.js";

describe("Magic command", () => {
  it("should validate query", async () => {
    const result = await magic.command(({
      id: "test",
      content: "|magic",
    } as Partial<Message>) as never);
    assert.equal(result, "failed");
  });
});
