import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { z } from "zod";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    const shape = schema._def.shape() as { [key: string]: z.ZodType<any> };

    return (
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Field</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Validation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(shape)
              .filter(([key]) => key !== "db_id")
              .map(([key, field]) => (
                <TableRow key={key}>
                  <TableCell className="font-medium">{key}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FieldBadges field={field} />

                      {field instanceof z.ZodObject && (
                        <Accordion type="single" collapsible>
                          <AccordionItem value="item-1">
                            <AccordionTrigger>
                              View Object Schema
                            </AccordionTrigger>
                            <AccordionContent>
                              <SchemaField schema={field} depth={depth + 1} />
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}

                      {field instanceof z.ZodArray && (
                        <div>
                          <span className="text-sm text-muted-foreground">
                            Array of:
                          </span>
                          <SchemaField
                            schema={field.element}
                            depth={depth + 1}
                          />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <FieldValidation field={field} />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
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
  // First, handle optional types by unwrapping them
  if (field instanceof z.ZodOptional) {
    return getFieldType(field.unwrap());
  }

  // Then handle the regular types
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
    const def = field._def;
    if (def.checks) {
      def.checks.forEach((check: any) => {
        if (check.kind === "min") checks.push(`Min length: ${check.value}`);
        if (check.kind === "max") checks.push(`Max length: ${check.value}`);
      });
    }
  }

  if (field instanceof z.ZodNumber) {
    const def = field._def;
    if (def.checks) {
      def.checks.forEach((check: any) => {
        if (check.kind === "min") checks.push(`Min: ${check.value}`);
        if (check.kind === "max") checks.push(`Max: ${check.value}`);
      });
    }
  }

  return checks;
}
