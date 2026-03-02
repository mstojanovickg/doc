from fastapi import APIRouter, HTTPException
from app.models.inputs import CalculationInput
from app.models.outputs import CalculationResult
from app.engine.calculator import calculate

router = APIRouter(prefix="/api/calculate", tags=["calculate"])


@router.post("", response_model=CalculationResult)
async def run_calculation(inp: CalculationInput) -> CalculationResult:
    try:
        return calculate(inp)
    except ZeroDivisionError as exc:
        raise HTTPException(status_code=422, detail=f"Division by zero in calculation: {exc}")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
