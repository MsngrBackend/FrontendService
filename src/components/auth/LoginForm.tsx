import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "../../store/authStore";
import { Input } from "../ui/Input";
import { PasswordInput } from "../ui/PasswordInput";
import { Button } from "../ui/Button";
import type { ApiError } from "../../api/client";

const schema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(1, "Введите пароль"),
});

type FormData = z.infer<typeof schema>;

interface LoginFormProps {
  onSwitch: () => void;
}

export const LoginForm = ({ onSwitch }: LoginFormProps) => {
  const login = useAuthStore((s) => s.login);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    try {
      await login(data.email, data.password);
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 401) setServerError("Неверный email или пароль");
      else if (err.status === 403) setServerError("Email не подтверждён");
      else setServerError("Что-то пошло не так. Попробуйте позже");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <PasswordInput
        label="Пароль"
        placeholder="••••••••"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />

      {serverError && (
        <p className="text-sm text-red-500 text-center">{serverError}</p>
      )}

      <Button type="submit" loading={isSubmitting} className="w-full mt-1">
        Войти
      </Button>

      <p className="text-sm text-center text-(--text-muted)">
        Нет аккаунта?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-(--accent) hover:underline font-medium"
        >
          Зарегистрироваться
        </button>
      </p>
    </form>
  );
}
