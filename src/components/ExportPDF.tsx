// src/components/ExportPDF.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileDown, Download, Eye } from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ActionData {
    id?: string;
    title: string;
    description?: string;
    assignedTo?: string;
    sourceCard?: {
        text: string;
        votes: number;
    };
}

interface BoardData {
    name: string;
    createdBy: string;
    participants: string[];
    columns: string[];
}

interface RetroCardData {
    id: string;
    text: string;
    author: string;
    votes: number;
    highlighted?: boolean;
}

interface Column {
    id: string;
    title: string;
    cards: RetroCardData[];
}

interface ExportPDFProps {
    boardData: BoardData | null;
    columns: Column[];
    actions: ActionData[];
    retroId: string;
}

const ExportPDF = ({ boardData, columns, actions, retroId }: ExportPDFProps) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Génération du contenu HTML pour l'export
    const generateHTMLContent = (): string => {
        const currentDate = new Date().toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Statistiques générales
        const totalCards = columns.reduce((sum, col) => sum + col.cards.length, 0);
        const highlightedCards = columns.reduce((sum, col) =>
            sum + col.cards.filter(card => card.highlighted).length, 0
        );
        const totalVotes = columns.reduce((sum, col) =>
            sum + col.cards.reduce((cardSum, card) => cardSum + card.votes, 0), 0
        );

        // Actions par assignation
        const actionsByAssignment = actions.reduce((acc, action) => {
            const key = action.assignedTo || 'Non assigné';
            if (!acc[key]) acc[key] = [];
            acc[key].push(action);
            return acc;
        }, {} as Record<string, ActionData[]>);

        return `
            <div style="font-family: 'Arial', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: white; color: #1F2937;">
                <!-- En-tête avec branding Rekaps -->
                <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #3B82F6; padding-bottom: 20px;">
                    
                    <h2 style="color: #1F2937; font-size: 24px; margin: 0 0 8px 0; font-weight: bold;">
                        Rapport de Rétrospective
                    </h2>
                    <h3 style="color: #3B82F6; font-size: 18px; margin: 0 0 15px 0; font-weight: normal;">
                        ${boardData?.name || 'Rétrospective'}
                    </h3>
                    
                    <div style="background: #F8FAFC; border-radius: 8px; padding: 10px; margin: 10px 0;">
                        <p style="color: #6B7280; margin: 2px 0; font-size: 13px;">
                            <strong>ID Session:</strong> ${retroId} • <strong>Date:</strong> ${currentDate}
                        </p>
                        <p style="color: #6B7280; margin: 2px 0; font-size: 13px;">
                            <strong>Participants:</strong> ${boardData?.participants.length || 1} • <strong>Plateforme:</strong> Rekaps
                        </p>
                    </div>
                </div>

                <!-- Résumé Exécutif -->
                <div style="background: linear-gradient(135deg, #F8FAFC, #EFF6FF); border-left: 5px solid #3B82F6; border-radius: 0 8px 8px 0; padding: 25px; margin-bottom: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h3 style="color: #1F2937; font-size: 20px; margin: 0 0 20px 0; display: flex; align-items: center;">
                        📊 Résumé Exécutif
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 20px;">
                        <div style="text-align: center; background: white; padding: 20px; border-radius: 12px; border: 2px solid #E5E7EB; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                            <div style="font-size: 28px; font-weight: bold; color: #3B82F6; margin-bottom: 5px;">${totalCards}</div>
                            <div style="font-size: 12px; color: #6B7280; font-weight: 500;">Cartes créées</div>
                        </div>
                        <div style="text-align: center; background: white; padding: 20px; border-radius: 12px; border: 2px solid #E5E7EB; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                            <div style="font-size: 28px; font-weight: bold; color: #F59E0B; margin-bottom: 5px;">${highlightedCards}</div>
                            <div style="font-size: 12px; color: #6B7280; font-weight: 500;">En évidence</div>
                        </div>
                        <div style="text-align: center; background: white; padding: 20px; border-radius: 12px; border: 2px solid #E5E7EB; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                            <div style="font-size: 28px; font-weight: bold; color: #10B981; margin-bottom: 5px;">${actions.length}</div>
                            <div style="font-size: 12px; color: #6B7280; font-weight: 500;">Actions</div>
                        </div>
                        <div style="text-align: center; background: white; padding: 20px; border-radius: 12px; border: 2px solid #E5E7EB; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                            <div style="font-size: 28px; font-weight: bold; color: #EF4444; margin-bottom: 5px;">${totalVotes}</div>
                            <div style="font-size: 12px; color: #6B7280; font-weight: 500;">Total votes</div>
                        </div>
                    </div>
                </div>

                <!-- Actions Prioritaires -->
                ${actions.length > 0 ? `
                <div style="margin-bottom: 35px;">
                    <h3 style="color: #1F2937; font-size: 20px; margin: 0 0 20px 0; display: flex; align-items: center; border-bottom: 3px solid #10B981; padding-bottom: 10px;">
                        🎯 Plan d'Actions Prioritaires
                    </h3>
                    
                    ${Object.entries(actionsByAssignment).map(([assignee, assigneeActions]) => `
                        <div style="margin-bottom: 30px; background: linear-gradient(135deg, #F0FDF4, #ECFDF5); border: 2px solid #BBF7D0; border-radius: 12px; padding: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                            <h4 style="color: #166534; font-size: 18px; margin: 0 0 20px 0; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #BBF7D0; padding-bottom: 10px;">
                                <span style="display: flex; align-items: center;">
                                    ${assignee === 'all-team' ? '👥 Assigné à toute l\'équipe' :
            assignee === 'Non assigné' ? '⚪ Actions non assignées' :
                `👤 Assigné à ${assignee}`}
                                </span>
                                <span style="background: #10B981; color: white; font-size: 12px; padding: 4px 12px; border-radius: 20px; font-weight: 600;">
                                    ${assigneeActions.length} action${assigneeActions.length > 1 ? 's' : ''}
                                </span>
                            </h4>
                            
                            ${assigneeActions.map((action, index) => `
                                <div style="background: white; border: 2px solid #D1FAE5; border-radius: 10px; padding: 20px; margin-bottom: ${index === assigneeActions.length - 1 ? '0' : '15px'}; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">
                                    <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                                        <div style="background: #10B981; border-radius: 50%; width: 8px; height: 8px; margin-top: 6px; margin-right: 12px; flex-shrink: 0;"></div>
                                        <h5 style="color: #1F2937; font-size: 16px; font-weight: bold; margin: 0; flex: 1; line-height: 1.4;">
                                            ${action.title}
                                        </h5>
                                    </div>
                                    ${action.description ? `
                                        <p style="color: #4B5563; font-size: 14px; margin: 0 0 15px 20px; line-height: 1.5; font-style: italic;">
                                            ${action.description}
                                        </p>
                                    ` : ''}
                                    ${action.sourceCard ? `
                                        <div style="background: linear-gradient(135deg, #EFF6FF, #DBEAFE); border: 1px solid #93C5FD; border-radius: 8px; padding: 15px; margin: 15px 0 0 20px;">
                                            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                                                <span style="background: #3B82F6; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 10px; margin-right: 8px;">📝</span>
                                                <p style="color: #1E40AF; font-size: 12px; margin: 0; font-weight: 600;">
                                                    Basée sur une carte de la rétrospective (${action.sourceCard.votes} vote${action.sourceCard.votes !== 1 ? 's' : ''})
                                                </p>
                                            </div>
                                            <p style="color: #1E40AF; font-size: 13px; margin: 0; font-style: italic; padding-left: 28px; line-height: 1.4;">
                                                "${action.sourceCard.text}"
                                            </p>
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>
                ` : `
                <div style="text-align: center; background: linear-gradient(135deg, #FEF3C7, #FDE68A); border: 2px solid #F59E0B; border-radius: 12px; padding: 40px; margin-bottom: 35px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <div style="font-size: 48px; margin-bottom: 15px;">🎯</div>
                    <h3 style="color: #92400E; font-size: 18px; margin: 0 0 10px 0; font-weight: bold;">Aucune action définie</h3>
                </div>
                `}

                

                <!-- Pied de page avec branding -->
                <div style="border-top: 3px solid #E5E7EB; padding-top: 25px; text-align: center; margin-top: 40px; background: #F8FAFC; border-radius: 12px; padding: 25px;">
                    <div style="margin-bottom: 15px;">
                        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                            <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #3B82F6, #8B5CF6); border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-right: 8px;">
                                <span style="color: white; font-size: 12px;">📊</span>
                            </div>
                            <span style="color: #1F2937; font-weight: bold; font-size: 16px;">Rekaps</span>
                        </div>
                        <p style="color: #6B7280; font-size: 12px; margin: 5px 0;">
                            Document généré automatiquement • ${currentDate}
                        </p>
                    </div>
                    
                    <div style="border-top: 1px solid #D1D5DB; padding-top: 15px; margin-top: 15px;">
                        <p style="color: #3B82F6; font-size: 12px; margin: 0 0 5px 0; font-weight: 600;">
                            🌐 rekaps.ziadlahrouni.com
                        </p>
                        <p style="color: #6B7280; font-size: 11px; margin: 0;">
                            Développé par ziadlahrouni.com
                        </p>
                        <p style="color: #9CA3AF; font-size: 10px; margin: 8px 0 0 0;">
                            Session ID: ${retroId}
                        </p>
                    </div>
                </div>
            </div>
        `;
    };

    const generatePDF = async (): Promise<void> => {
        setIsGenerating(true);
        try {
            // Créer un élément temporaire avec le contenu
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = generateHTMLContent();
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.top = '0';
            tempDiv.style.width = '800px';
            tempDiv.style.backgroundColor = '#ffffff';
            document.body.appendChild(tempDiv);

            // Attendre que le DOM soit rendu
            await new Promise(resolve => setTimeout(resolve, 200));

            // Créer le PDF avec gestion intelligente des pages
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const margin = 10; // Marges en mm
            const contentWidth = pageWidth - (margin * 2);
            const contentHeight = pageHeight - (margin * 2);

            // Diviser le contenu en sections logiques pour éviter les coupures
            const sections = tempDiv.querySelectorAll('.pdf-section');
            let currentYPosition = margin;
            let pageNumber = 1;

            // Si on trouve des sections, les traiter une par une
            if (sections.length > 0) {
                for (let i = 0; i < sections.length; i++) {
                    const section = sections[i] as HTMLElement;

                    // Créer un canvas pour cette section seulement
                    const sectionCanvas = await html2canvas(section, {
                        scale: 2,
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: '#ffffff',
                        width: 800,
                        scrollX: 0,
                        scrollY: 0
                    });

                    const imgData = sectionCanvas.toDataURL('image/png');
                    const imgWidth = contentWidth;
                    const imgHeight = (sectionCanvas.height * imgWidth) / sectionCanvas.width;

                    // Vérifier si la section tient sur la page actuelle
                    if (currentYPosition + imgHeight > pageHeight - margin && pageNumber > 1) {
                        // Ajouter une nouvelle page si la section ne tient pas
                        pdf.addPage();
                        currentYPosition = margin;
                        pageNumber++;
                    }

                    // Ajouter l'image de la section
                    pdf.addImage(imgData, 'PNG', margin, currentYPosition, imgWidth, imgHeight);
                    currentYPosition += imgHeight + 10; // Espacement entre sections

                    // Si c'est la première section (en-tête), ou si on dépasse la hauteur de page
                    if (i === 0 || currentYPosition > pageHeight - 50) {
                        if (i < sections.length - 1) { // Pas pour la dernière section
                            pdf.addPage();
                            currentYPosition = margin;
                            pageNumber++;
                        }
                    }
                }
            } else {
                // Fallback : utiliser l'ancienne méthode si aucune section n'est trouvée
                const canvas = await html2canvas(tempDiv, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    width: 800,
                    scrollX: 0,
                    scrollY: 0
                });

                const imgData = canvas.toDataURL('image/png');
                const imgWidth = contentWidth;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                // Découper intelligemment en pages
                let yPosition = 0;
                let page = 1;
                const pageContentHeight = contentHeight;

                while (yPosition < imgHeight) {
                    if (page > 1) {
                        pdf.addPage();
                    }

                    const remainingHeight = imgHeight - yPosition;
                    const currentPageHeight = Math.min(pageContentHeight, remainingHeight);

                    if (currentPageHeight > 0) {
                        // Calculer les coordonnées source dans le canvas original
                        const sourceY = (yPosition * canvas.height) / imgHeight;
                        const sourceHeight = (currentPageHeight * canvas.height) / imgHeight;

                        // Créer un canvas temporaire pour cette portion de page
                        const pageCanvas = document.createElement('canvas');
                        const ctx = pageCanvas.getContext('2d');
                        pageCanvas.width = canvas.width;
                        pageCanvas.height = sourceHeight;

                        if (ctx) {
                            ctx.fillStyle = '#ffffff';
                            ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

                            ctx.drawImage(
                                canvas,
                                0, sourceY, canvas.width, sourceHeight,
                                0, 0, canvas.width, sourceHeight
                            );

                            const pageImgData = pageCanvas.toDataURL('image/png');
                            pdf.addImage(pageImgData, 'PNG', margin, margin, imgWidth, currentPageHeight);
                        }
                    }

                    yPosition += pageContentHeight;
                    page++;
                }
            }

            // Nettoyer
            document.body.removeChild(tempDiv);

            // Télécharger le PDF
            const fileName = `rekaps-retro-${boardData?.name?.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-') || retroId}-${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);

        } catch (error) {
            console.error('Erreur lors de la génération du PDF:', error);
            alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(true)}
                    className="flex items-center space-x-2"
                >
                    <FileDown className="w-4 h-4" />
                    <span>Export PDF</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <FileDown className="w-5 h-5 text-blue-600" />
                        <span>Aperçu du Rapport PDF - Rekaps</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Aperçu du contenu */}
                    <div
                        className="border border-gray-200 rounded-lg p-4 bg-white max-h-[400px] overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: generateHTMLContent() }}
                    />

                    {/* Boutons d'action */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={() => setShowPreview(false)}
                            disabled={isGenerating}
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            Fermer l'aperçu
                        </Button>
                        <Button
                            onClick={generatePDF}
                            disabled={isGenerating}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Génération...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Télécharger PDF
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ExportPDF;