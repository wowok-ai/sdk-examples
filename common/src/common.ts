
export const TEST_ADDR = (): string => {  
    if (process.env.ADDR) {
        return process.env.ADDR as string 
    } else {
        return "0xe386bb9e01b3528b75f3751ad8a1e418b207ad979fea364087deef5250a73d3f"
    }
}

export const TEST_PRIV = (): string => {  
    if (process.env.PRIV) {
        return process.env.PRIV as string 
    } else {
        return "0xc9bbc30f72ef7d9aa674a3be1448b9267141a676b59f3f4315231617a5bbc0e8"
    }
}
