import { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Login Successful" },
    { name: "description", content: "You have successfully logged in" },
  ];
};

export default function LoginSuccess() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 
        className="text-4xl font-bold text-green-500 mb-8 text-center"
        style={{ fontSize: "3rem", color: "#22c55e" }}
      >
        Login Successful!
      </h1>
      <p className="text-xl mb-8 text-center">You have been successfully authenticated, antcar0929@gmail.com</p>
    </div>
  );
}
