import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { z } from "zod";
import { cn } from "@/lib/utils";

interface SchemaDocProps {
  schema: z.ZodType<any>;
  title?: string;
}

export function SchemaDoc({ schema, title }: SchemaDocProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title || "Schema Documentation"}</CardTitle>
      </CardHeader>
      <CardContent>
        <SchemaField schema={schema} />
      </CardContent>
    </Card>
  );
}

function SchemaField({
  schema,
  depth = 0,
}: {
  schema: z.ZodType<any>;
  depth?: number;
}) {
  if (schema instanceof z.ZodObject) {
    const shape = schema._def.shape();

    return (
      <div className="space-y-4">
        {Object.entries(shape).map(([key, field]) => (
          <div key={key} className={cn("pl-4", depth > 0 && "border-l")}>
            <div className="flex items-center gap-2">
              <span className="font-medium">{key}</span>
              <FieldBadges field={field} />
            </div>

            {field instanceof z.ZodObject && (
              <Accordion type="single" collapsible className="mt-2">
                <AccordionItem value="item-1">
                  <AccordionTrigger>View Object Schema</AccordionTrigger>
                  <AccordionContent>
                    <SchemaField schema={field} depth={depth + 1} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            {field instanceof z.ZodArray && (
              <div className="mt-2 pl-4">
                <span className="text-sm text-muted-foreground">Array of:</span>
                <SchemaField schema={field.element} depth={depth + 1} />
              </div>
            )}

            <FieldValidation field={field} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="text-sm text-muted-foreground">{getFieldType(schema)}</div>
  );
}

function FieldBadges({ field }: { field: z.ZodType<any> }) {
  return (
    <>
      <Badge variant="outline">{getFieldType(field)}</Badge>
      {field.isOptional() && <Badge variant="secondary">Optional</Badge>}
    </>
  );
}

function FieldValidation({ field }: { field: z.ZodType<any> }) {
  const checks = getValidationChecks(field);

  if (!checks.length) return null;

  return (
    <div className="mt-1 text-sm text-muted-foreground">
      {checks.map((check, i) => (
        <div key={i}>{check}</div>
      ))}
    </div>
  );
}

function getFieldType(field: z.ZodType<any>): string {
  if (field instanceof z.ZodString) return "string";
  if (field instanceof z.ZodNumber) return "number";
  if (field instanceof z.ZodBigInt) return "bigint";
  if (field instanceof z.ZodBoolean) return "boolean";
  if (field instanceof z.ZodArray) return "array";
  if (field instanceof z.ZodObject) return "object";
  if (field instanceof z.ZodEnum) return "enum";
  if (field instanceof z.ZodNativeEnum) return "enum";
  return "unknown";
}

function getValidationChecks(field: z.ZodType<any>): string[] {
  const checks: string[] = [];

  if (field instanceof z.ZodString) {
    if (field.minLength !== null) checks.push(`Min length: ${field.minLength}`);
    if (field.maxLength !== null) checks.push(`Max length: ${field.maxLength}`);
  }

  if (field instanceof z.ZodNumber) {
    const def = field._def;
    if (def.minimum !== undefined) checks.push(`Min: ${def.minimum}`);
    if (def.maximum !== undefined) checks.push(`Max: ${def.maximum}`);
  }

  return checks;
}
