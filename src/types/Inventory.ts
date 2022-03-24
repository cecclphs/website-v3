export default interface InventoryItem {
    id: string,
    name: string,
    parent: string,
    children: string[],
    simpleId: string;
    metadata: {
        donatedBy: string,
        donatedOn: string,
    }
}
