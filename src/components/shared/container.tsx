import React from 'react';

interface ContainerProps {
    children:React.ReactNode;
}

const Container:React.FC<ContainerProps> = ({children})=>{
    return <main className={"container mx-auto p-4 md:p-8"}>
        {children}
    </main>
}

export default Container;