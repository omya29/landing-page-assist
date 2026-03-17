import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface ResourceFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  department: string;
  onDepartmentChange: (value: string) => void;
  year: string;
  onYearChange: (value: string) => void;
  fileType: string;
  onFileTypeChange: (value: string) => void;
}

export function ResourceFilters({
  search,
  onSearchChange,
  department,
  onDepartmentChange,
  year,
  onYearChange,
  fileType,
  onFileTypeChange,
}: ResourceFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search resources..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={department} onValueChange={onDepartmentChange}>
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Depts</SelectItem>
          <SelectItem value="civil">Civil</SelectItem>
          <SelectItem value="comp">Computer</SelectItem>
          <SelectItem value="mba">MBA</SelectItem>
          <SelectItem value="mech">Mechanical</SelectItem>
          <SelectItem value="entc">ENTC</SelectItem>
        </SelectContent>
      </Select>
      <Select value={year} onValueChange={onYearChange}>
        <SelectTrigger className="w-full sm:w-[120px]">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Years</SelectItem>
          <SelectItem value="FE">FE</SelectItem>
          <SelectItem value="SE">SE</SelectItem>
          <SelectItem value="TE">TE</SelectItem>
          <SelectItem value="BE">BE</SelectItem>
        </SelectContent>
      </Select>
      <Select value={fileType} onValueChange={onFileTypeChange}>
        <SelectTrigger className="w-full sm:w-[120px]">
          <SelectValue placeholder="File Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="pdf">PDF</SelectItem>
          <SelectItem value="doc">Document</SelectItem>
          <SelectItem value="ppt">Presentation</SelectItem>
          <SelectItem value="image">Image</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
