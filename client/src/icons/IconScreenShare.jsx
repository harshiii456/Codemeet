import * as React from "react";

function IconScreen(props) {
    return (
        <svg fill="none" viewBox="0 0 15 15" height="1.5em" width="1.5em" {...props}>
            <path
                fill="currentColor"
                d="M1.5 1A1.5 1.5 0 000 2.5v8A1.5 1.5 0 001.5 12h12a1.5 1.5 0 001.5-1.5v-8A1.5 1.5 0 0013.5 1h-12zM4 15h7v-1H4v1z"
            />
        </svg>
    );
}

export default IconScreen;
