"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UserProfile } from "@/lib/types";
import { Download, Mail, QrCode, User } from "lucide-react";
import Image from "next/image";

export function UserDetailModal({
  user,
  onClose,
}: {
  user: UserProfile | null;
  onClose: () => void;
}) {
  if (!user) return null;

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="relative bg-muted/50 p-8 pb-20 border-b">
          <div className="flex flex-col items-center">
            <div
              className={`w-28 h-28 rounded-full ${user.avatarGradient} flex items-center justify-center text-4xl font-bold text-white mb-4 shadow-lg border-4 border-card`}
            >
              {user.name.charAt(0)}
              {user.name.split(" ")[1]?.charAt(0)}
            </div>
            <h2 className="text-2xl font-bold text-foreground text-center">
              {user.name}
            </h2>
            <p className="text-muted-foreground font-medium">
              {user.roleOrGrade} • {user.type}
            </p>
          </div>
        </div>

        <Tabs defaultValue="personal" className="w-full">
          <div className="-mt-12 relative z-10 bg-card rounded-t-3xl border-b">
            <TabsList className="grid w-full grid-cols-3 bg-transparent px-8 h-auto">
              <TabsTrigger value="personal" className="py-4 font-semibold text-muted-foreground data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Información Personal</TabsTrigger>
              <TabsTrigger value="academic" className="py-4 font-semibold text-muted-foreground data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                {user.type === "Estudiante" ? "Académico" : "Institucional"}
              </TabsTrigger>
              <TabsTrigger value="qr" className="py-4 font-semibold text-muted-foreground data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Código QR</TabsTrigger>
            </TabsList>
          </div>
          <div className="p-8 h-[350px] overflow-y-auto">
            <TabsContent value="personal">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold mb-1">DNI</p>
                  <p className="text-foreground font-medium">{user.dni}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Email</p>
                  <p className="text-foreground font-medium flex items-center gap-1">
                    <Mail size={14} className="text-muted-foreground" /> {user.email}
                  </p>
                </div>
                <div className="md:col-span-2 pt-4 border-t">
                  <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Estado</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      user.status === "Activo"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {user.status}
                  </span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="academic">
                <div className="text-muted-foreground text-center py-8">Información académica detallada aquí.</div>
            </TabsContent>
            <TabsContent value="qr">
              <div className="flex flex-col items-center justify-center py-4">
                <div className="bg-card p-4 rounded-xl border-2 shadow-inner mb-4">
                  <QrCode size={150} className="text-foreground" />
                </div>
                <Button><Download size={16} /> Descargar QR</Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
