import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProfileSchema, setProfileSchema } from "@/lib/services/profile-schema";

const FieldSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z_][a-z0-9_]*$/, "Use apenas letras minúsculas, números e _"),
  label: z.string().min(1).max(80),
  type: z.enum(["string", "enum"]),
  options: z.array(z.string().min(1).max(100)).max(50).optional(),
  description: z.string().max(200).optional(),
});

const PutSchema = z.object({
  schema: z.array(FieldSchema).max(30),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const schema = await getProfileSchema(session.user.id);
  return NextResponse.json({ schema });
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = PutSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Schema inválido", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Validate enum fields have options
  for (const field of parsed.data.schema) {
    if (field.type === "enum" && (!field.options || field.options.length === 0)) {
      return NextResponse.json(
        { error: `Campo "${field.key}" é do tipo enum mas não tem opções definidas` },
        { status: 400 }
      );
    }
  }

  await setProfileSchema(session.user.id, parsed.data.schema);
  return NextResponse.json({ schema: parsed.data.schema });
}
