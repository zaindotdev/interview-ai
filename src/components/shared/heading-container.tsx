import React from 'react';

interface HeadingContainerProps {
    children:React.ReactNode;
}

const HeadingContainer:React.FC<HeadingContainerProps> = ({children})=>{
    return <main className={"max-w-3xl mx-auto"}>
        {children}
    </main>
}

export default HeadingContainer;