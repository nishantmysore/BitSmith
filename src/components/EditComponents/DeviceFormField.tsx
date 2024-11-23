import { DeviceFormFieldProps } from "@/types/validation";
import { Input } from "@/components/ui/input";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"

const DeviceFormField: React.FC<DeviceFormFieldProps> = ({
  type,
  placeholder,
  name,
  register,
  error,
  valueAsNumber,
  defaultValue,
}) => (
  <>
    <Input
      type={type}
      placeholder={placeholder}
      defaultValue={defaultValue}
      {...register(name, { valueAsNumber })}
    />
    {error && <Alert variant="destructive">
      <AlertDescription>
      {error.message}
      </AlertDescription>
    </Alert>
    }
  </>
);
export default DeviceFormField;
