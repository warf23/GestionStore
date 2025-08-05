'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { X, User, Calendar, Package, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PurchaseWithLines } from '@/types'

interface PurchaseViewModalProps {
  isOpen: boolean
  onClose: () => void
  purchase: PurchaseWithLines | null
}

export function PurchaseViewModal({ isOpen, onClose, purchase }: PurchaseViewModalProps) {
  if (!isOpen || !purchase) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Détails de l'Achat #{purchase.id}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Purchase Info */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Fournisseur</p>
                    <p className="font-medium">{purchase.nom_fournisseur}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Date d'achat</p>
                    <p className="font-medium">
                      {format(new Date(purchase.date_achat), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {purchase.utilisateurs && (
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Acheteur</p>
                      <p className="font-medium">
                        {purchase.utilisateurs.prenom} {purchase.utilisateurs.nom}
                      </p>
                      <p className="text-sm text-gray-500">{purchase.utilisateurs.email}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {parseFloat(purchase.total.toString()).toFixed(2)} DH
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Package className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-medium">Produits achetés</h3>
                <Badge variant="secondary">{purchase.lignes_achat.length}</Badge>
              </div>

              <div className="space-y-3">
                {purchase.lignes_achat.map((line, index) => (
                  <div key={line.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{line.produit_nom}</h4>
                      <p className="text-sm text-gray-500">
                        {line.quantite} × {parseFloat(line.prix_unitaire.toString()).toFixed(2)} DH
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-blue-600">
                        {parseFloat(line.total_ligne.toString()).toFixed(2)} DH
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {purchase.lignes_achat.length}
                  </p>
                  <p className="text-sm text-gray-600">Article(s)</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {purchase.lignes_achat.reduce((sum, line) => sum + line.quantite, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Quantité totale</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {parseFloat(purchase.total.toString()).toFixed(2)} DH
                  </p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t bg-gray-50">
          <Button onClick={onClose}>Fermer</Button>
        </div>
      </div>
    </div>
  )
}