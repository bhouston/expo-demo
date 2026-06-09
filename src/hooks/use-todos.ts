import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { type Todo, type TodoFormValues } from "@/lib/schema";
import {
  addTodo,
  deleteAllTodos,
  deleteTodo,
  generateFakeTodos,
  getTodos,
} from "@/lib/todo-storage";

export const todosQueryKey = ["todos"] as const;

export function useTodos() {
  return useQuery({
    queryKey: todosQueryKey,
    queryFn: getTodos,
  });
}

/**
 * The storage functions all resolve with the full updated list, so each
 * mutation writes the result straight into the query cache instead of
 * refetching.
 */
function useTodosMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<Todo[]>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (todos) => {
      queryClient.setQueryData(todosQueryKey, todos);
    },
  });
}

export function useAddTodo() {
  return useTodosMutation((values: TodoFormValues) => addTodo(values));
}

export function useDeleteTodo() {
  return useTodosMutation((id: string) => deleteTodo(id));
}

export function useDeleteAllTodos() {
  return useTodosMutation(() => deleteAllTodos());
}

export function useGenerateTodos() {
  return useTodosMutation((count: number) => generateFakeTodos(count));
}
