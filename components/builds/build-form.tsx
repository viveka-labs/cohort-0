'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  CheckIcon,
  ChevronsUpDownIcon,
  Loader2Icon,
  XIcon,
} from 'lucide-react';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { createBuildAction } from '@/app/actions/builds';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  type BuildFormData,
  type BuildFormInput,
  buildFormSchema,
} from '@/lib/validations/build';
import type { AiTool, TechStackTag } from '@/types';

// ---------------------------------------------------------------------------
// Build type labels — maps enum values to human-readable text
// ---------------------------------------------------------------------------

const BUILD_TYPE_LABELS: Record<BuildFormData['build_type'], string> = {
  app: 'App',
  feature: 'Feature',
  fix: 'Fix',
  automation: 'Automation',
  experiment: 'Experiment',
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type BuildFormProps = {
  aiTools: AiTool[];
  techStackTags: TechStackTag[];
};

// ---------------------------------------------------------------------------
// BuildForm
// ---------------------------------------------------------------------------

export function BuildForm({ aiTools, techStackTags }: BuildFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<BuildFormInput, unknown, BuildFormData>({
    resolver: zodResolver(buildFormSchema),
    defaultValues: {
      title: '',
      description: '',
      build_type: 'app',
      live_url: '',
      repo_url: '',
      ai_tool_ids: [],
      tech_stack_tag_ids: [],
    },
  });

  function onSubmit(data: BuildFormData) {
    startTransition(async () => {
      const result = await createBuildAction(data);

      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="My awesome build" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell the community what you built and how you built it..."
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Build Type */}
        <FormField
          control={form.control}
          name="build_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Build Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a build type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(BUILD_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Live URL */}
        <FormField
          control={form.control}
          name="live_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Live URL{' '}
                <span className="text-muted-foreground">(optional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://my-project.vercel.app"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Repo URL */}
        <FormField
          control={form.control}
          name="repo_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Repository URL{' '}
                <span className="text-muted-foreground">(optional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://github.com/you/your-project"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* AI Tools (multi-select) */}
        <FormField
          control={form.control}
          name="ai_tool_ids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AI Tools Used</FormLabel>
              <MultiSelectCombobox
                items={aiTools.map((tool) => ({
                  value: tool.id,
                  label: tool.name,
                }))}
                selectedValues={field.value}
                onSelectionChange={field.onChange}
                placeholder="Select AI tools..."
                searchPlaceholder="Search AI tools..."
                emptyMessage="No AI tools found."
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tech Stack Tags (multi-select) */}
        <FormField
          control={form.control}
          name="tech_stack_tag_ids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Tech Stack{' '}
                <span className="text-muted-foreground">(optional)</span>
              </FormLabel>
              <MultiSelectCombobox
                items={techStackTags.map((tag) => ({
                  value: tag.id,
                  label: tag.name,
                }))}
                selectedValues={field.value}
                onSelectionChange={field.onChange}
                placeholder="Select tech stack..."
                searchPlaceholder="Search tech stack..."
                emptyMessage="No tags found."
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2Icon className="animate-spin" />}
          {isPending ? 'Submitting...' : 'Submit Build'}
        </Button>
      </form>
    </Form>
  );
}

// ---------------------------------------------------------------------------
// MultiSelectCombobox — reusable Popover + Command multi-select
// ---------------------------------------------------------------------------

type ComboboxItem = {
  value: string;
  label: string;
};

type MultiSelectComboboxProps = {
  items: ComboboxItem[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
};

function MultiSelectCombobox({
  items,
  selectedValues,
  onSelectionChange,
  placeholder,
  searchPlaceholder,
  emptyMessage,
}: MultiSelectComboboxProps) {
  function toggleItem(value: string) {
    if (selectedValues.includes(value)) {
      onSelectionChange(selectedValues.filter((v) => v !== value));
    } else {
      onSelectionChange([...selectedValues, value]);
    }
  }

  function removeItem(value: string) {
    onSelectionChange(selectedValues.filter((v) => v !== value));
  }

  const selectedItems = items.filter((item) =>
    selectedValues.includes(item.value)
  );

  return (
    <div className="space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                'w-full justify-between font-normal',
                selectedValues.length === 0 && 'text-muted-foreground'
              )}
            >
              {selectedValues.length > 0
                ? `${selectedValues.length} selected`
                : placeholder}
              <ChevronsUpDownIcon className="opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {items.map((item) => {
                  const isSelected = selectedValues.includes(item.value);

                  return (
                    <CommandItem
                      key={item.value}
                      value={item.label}
                      onSelect={() => toggleItem(item.value)}
                    >
                      <div
                        className={cn(
                          'flex size-4 shrink-0 items-center justify-center rounded-sm border border-primary',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'opacity-50 [&_svg]:invisible'
                        )}
                      >
                        <CheckIcon className="size-3" />
                      </div>
                      {item.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Display selected items as badges */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedItems.map((item) => (
            <Badge key={item.value} variant="secondary">
              {item.label}
              <button
                type="button"
                className="ml-1 rounded-full outline-none hover:text-foreground"
                onClick={() => removeItem(item.value)}
                aria-label={`Remove ${item.label}`}
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
