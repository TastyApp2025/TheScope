import { insertStorySchema } from "@shared/schema";
import { z } from "zod";

console.log("insertStorySchema type:", Object.prototype.toString.call(insertStorySchema));
console.log("has partial:", typeof (insertStorySchema as any).partial);
console.log("is Zod schema instance:", insertStorySchema instanceof z.ZodType);
console.log("schema keys:", Object.keys(insertStorySchema));

// If it's a Zod object, log shape
if ((insertStorySchema as any).shape) {
  console.log("shape keys:", Object.keys((insertStorySchema as any).shape));
}

console.log("done");
