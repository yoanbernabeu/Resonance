/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    user: {
      login: string;
      avatarUrl: string;
      id: number;
      accessToken: string;
    } | null;
  }
}
