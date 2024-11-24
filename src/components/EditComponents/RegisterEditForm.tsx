import { UseFormRegister } from "react-hook-form";
import { DeviceFormData, acceptedWidthsStr } from "@/types/validation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

const RegisterEditForm = ({
  index,
  register,
  onChanged,
  onRemove,
}: {
  index: number;
  register: UseFormRegister<DeviceFormData>;
  onChanged: () => void;
  onRemove: () => void;
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <div onChange={onChanged}>
      <Accordion
        type="single"
        collapsible
        className="w-full border rounded-lg mb-4"
      >
        <AccordionItem value="basic-info">
          <AccordionTrigger className="px-4">
            <div className="flex items-center justify-between w-full">
              <span>{"New Register"}</span>

              <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <div className="">
                    <div
                      className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className=" text-destructive" />
                    </div>
                  </div>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Register</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this register? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onRemove}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 p-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`registers.${index}.name`}>Name</Label>
                  <Input
                    id={`registers.${index}.name`}
                    {...register(`registers.${index}.name`)}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`registers.${index}.description`}>
                    Description
                  </Label>
                  <Input
                    id={`registers.${index}.description`}
                    {...register(`registers.${index}.description`)}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-6 p-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`registers.${index}.address`}>Address</Label>
                  <Input
                    id={`registers.${index}.address`}
                    {...register(`registers.${index}.address`)}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`registers.${index}.width`}>Width</Label>
                  <Select
                    onValueChange={(value) => {
                      const event = {
                        target: { value },
                      };
                      register(`registers.${index}.width`).onChange(event);
                      onChanged();
                    }}
                  >
                    <SelectTrigger id={`registers.${index}.width`}>
                      <SelectValue placeholder="Select width" />
                    </SelectTrigger>
                    <SelectContent>
                      {acceptedWidthsStr.map((width) => (
                        <SelectItem key={width} value={width}>
                          {width}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default RegisterEditForm;
