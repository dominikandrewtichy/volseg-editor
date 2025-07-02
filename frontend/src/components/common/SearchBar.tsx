import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, XIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormField, FormItem } from "../ui/form";

interface SearchBarProps {
  initialValue?: string;
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
}

const formSchema = z.object({
  search_term: z.string(),
});

export function SearchBar({
  initialValue = "",
  onSearch,
  placeholder = "Search entries...",
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search_term: "",
    },
  });

  const handleSubmit = (data: { search_term: string }) => {
    onSearch(data.search_term);
  };

  const handleClear = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          name="search_term"
          control={form.control}
          render={() => (
            <FormItem className="flex w-full max-w-lg items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={placeholder}
                  className="px-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2.5 top-2.5 h-4 w-4"
                    onClick={handleClear}
                  >
                    <XIcon className="h-4 w-4" />
                    <span className="sr-only">Clear</span>
                  </Button>
                )}
              </div>
              <Button type="submit">Search</Button>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
