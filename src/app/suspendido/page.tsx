import Link from "next/link";

export default function SuspendidoPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-10 max-w-md text-center">
        <p className="text-6xl mb-4">🔒</p>
        <h1 className="text-2xl font-bold text-red-600 mb-2">
          Suscripción Vencida
        </h1>
        <p className="text-gray-500 mb-6">
          Tu suscripción ha vencido o no está activa. Para continuar usando
          el sistema, contacta a la administradora de la plataforma.
        </p>
        <div className="bg-red-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-600 font-medium">
            📞 Contacta a soporte:
          </p>
          <p className="text-sm text-gray-600 mt-1">
            admin@canchasaas.com
          </p>
        </div>
        <Link
          href="/login"
          className="text-green-600 hover:underline text-sm"
        >
          Volver al login
        </Link>
      </div>
    </div>
  );
}