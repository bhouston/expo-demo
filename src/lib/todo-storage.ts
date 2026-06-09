import AsyncStorage from "@react-native-async-storage/async-storage";
import { faker } from "@faker-js/faker";

import { todoListSchema, type Todo, type TodoFormValues } from "./schema";

const STORAGE_KEY = "todos/v1";

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function getTodos(): Promise<Todo[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  const parsed = todoListSchema.safeParse(JSON.parse(raw));
  return parsed.success ? parsed.data : [];
}

async function setTodos(todos: Todo[]): Promise<Todo[]> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  return todos;
}

export async function addTodo(values: TodoFormValues): Promise<Todo[]> {
  const todo: Todo = {
    id: createId(),
    title: values.title.trim(),
    description: values.description.trim() || undefined,
    createdAt: Date.now(),
  };
  const todos = await getTodos();
  return setTodos([todo, ...todos]);
}

export async function deleteTodo(id: string): Promise<Todo[]> {
  const todos = await getTodos();
  return setTodos(todos.filter((todo) => todo.id !== id));
}

export async function deleteAllTodos(): Promise<Todo[]> {
  return setTodos([]);
}

export async function generateFakeTodos(count: number): Promise<Todo[]> {
  const now = Date.now();
  const fakes: Todo[] = Array.from({ length: count }, (_, index) => ({
    id: createId() + `-${index}`,
    title: faker.hacker.phrase(),
    description: faker.datatype.boolean() ? faker.lorem.sentences(2) : undefined,
    createdAt: now - index,
  }));
  const todos = await getTodos();
  return setTodos([...fakes, ...todos]);
}
