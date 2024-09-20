import { TableCell, TableRow } from '../ui/table';

interface StoragePartsRowProps {
    part: {
        id: number;
        qty: number;
        factory_id: number;
        part_id: number;
        parts: {
            id: number;
            name: string;
            description: string;
            // Other fields you may need
        };
    };
}

const StoragePartsRow: React.FC<StoragePartsRowProps> = ({ part }) => {
    return (
        <TableRow>
            <TableCell>{part.id}</TableCell>
            <TableCell>{part.part_id}</TableCell>
            <TableCell>{part.parts.name}</TableCell> {/* Display the part name */}
            <TableCell>{part.qty}</TableCell>
            <TableCell>{part.factory_id}</TableCell>
        </TableRow>
    );
};

export default StoragePartsRow;
