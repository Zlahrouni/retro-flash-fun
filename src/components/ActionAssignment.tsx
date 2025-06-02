// src/components/ActionAssignment.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { UserCheck, Users, Check, X } from "lucide-react";

interface ActionAssignmentProps {
    currentAssignment?: string;
    participants: string[];
    onAssign: (assignedTo?: string) => void;
    disabled?: boolean;
}

const ActionAssignment = ({
                              currentAssignment,
                              participants,
                              onAssign,
                              disabled = false
                          }: ActionAssignmentProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredParticipants = participants.filter((participant) =>
        participant.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );

    const getAssignmentLabel = (assignment?: string) => {
        if (!assignment) return "Non assigné";
        if (assignment === "all-team") return "Toute l'équipe";
        return assignment;
    };

    const getAssignmentIcon = (assignment?: string) => {
        if (!assignment) return null;
        if (assignment === "all-team") return <Users className="w-4 h-4" />;
        return <UserCheck className="w-4 h-4" />;
    };

    const handleSelect = (value?: string) => {
        onAssign(value);
        setIsOpen(false);
        setSearchTerm("");
    };

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={() => setIsOpen(true)}
                className={`flex items-center space-x-2 min-w-[120px] justify-between ${
                    currentAssignment
                        ? currentAssignment === "all-team"
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-green-200 bg-green-50 text-green-700"
                        : "border-gray-200 bg-gray-50 text-gray-600"
                }`}
            >
                <div className="flex items-center space-x-2">
                    {getAssignmentIcon(currentAssignment)}
                    <span className="text-sm">{getAssignmentLabel(currentAssignment)}</span>
                </div>
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Assigner à un participant</DialogTitle>
                    </DialogHeader>

                    <Input
                        placeholder="Rechercher un participant..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-3"
                        autoFocus
                    />

                    <div className="space-y-1 max-h-64 overflow-y-auto">
                        {/* Non assigné */}
                        <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => handleSelect(undefined)}
                        >
                            <X className="w-4 h-4 text-gray-400 mr-2" />
                            Non assigné
                            {!currentAssignment && <Check className="ml-auto w-4 h-4 text-gray-600" />}
                        </Button>

                        {/* Toute l’équipe */}
                        <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => handleSelect("all-team")}
                        >
                            <Users className="w-4 h-4 text-blue-600 mr-2" />
                            Toute l'équipe
                            {currentAssignment === "all-team" && <Check className="ml-auto w-4 h-4 text-blue-600" />}
                        </Button>

                        {/* Participants */}
                        {filteredParticipants.length > 0 && (
                            <>
                                <div className="border-t border-gray-200 my-1"></div>
                                {filteredParticipants.map((participant) => (
                                    <Button
                                        key={participant}
                                        variant="ghost"
                                        className="w-full justify-start"
                                        onClick={() => handleSelect(participant)}
                                    >
                                        <UserCheck className="w-4 h-4 text-green-600 mr-2" />
                                        {participant}
                                        {currentAssignment === participant && (
                                            <Check className="ml-auto w-4 h-4 text-green-600" />
                                        )}
                                    </Button>
                                ))}
                            </>
                        )}

                        {searchTerm && filteredParticipants.length === 0 && (
                            <div className="text-center py-2 text-sm text-gray-500">
                                Aucun participant trouvé
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ActionAssignment;
