import React, { useState } from 'react';
import { UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const RegisterEditForm = ({
  index,
  register,
  onChanged,
  onRemove,
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    setIsDeleteDialogOpen(false);
    onRemove();
  };

  return (
    <div onChange={onChanged}>
      <Accordion
        type="single"
        collapsible
        className="w-full border rounded-lg mb-4"
        value={isAccordionOpen ? "basic-info" : ""}
        onValueChange={(value) => setIsAccordionOpen(value === "basic-info")}
      >
        <AccordionItem value="basic-info">
          <div className="flex items-center justify-between px-4">
            <AccordionTrigger className="flex-1">
              <span>New Register</span>
            </AccordionTrigger>
            
            <div 
              onClick={handleDelete}
              className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer"
            >
              <Trash2 className="text-destructive" />
            </div>
          </div>

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
                  <Label htmlFor={`registers.${index}.description`}>Description</Label>
                  <Input
                    id={`registers.${index}.description`}
                    {...register(`registers.${index}.description`)}
                  />
                </div>
              </div>
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
                      register(`registers.${index}.width`).onChange({ target: { value } });
                      onChanged();
                    }}
                  >
                    <SelectTrigger id={`registers.${index}.width`}>
                      <SelectValue placeholder="Select width" />
                    </SelectTrigger>
                    <SelectContent>
                      {["8", "16", "32"].map((width) => (
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

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Register</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this register? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RegisterEditForm;
